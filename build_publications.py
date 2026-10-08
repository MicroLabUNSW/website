import json
import re
from html import unescape
from pathlib import Path
from urllib.parse import unquote
from urllib.request import Request, urlopen

target = Path(__file__).with_name("publications-data.js")
request = Request(
    "https://pub.orcid.org/v3.0/0000-0001-7450-6205/works",
    headers={"Accept": "application/json", "User-Agent": "Ming-Li-Lab-Website/1.0"},
)
with urlopen(request, timeout=30) as response:
    works = json.load(response)["group"]
rows = []
seen = set()
seen_dois = set()
journal_names = {
    "TrAC - Trends in Analytical Chemistry": "Trends in Analytical Chemistry",
    "Microsystems and Nanoengineering": "Microsystems & Nanoengineering",
    "Sensors and Actuators, B: Chemical": "Sensors and Actuators B: Chemical",
    "Journal of Physics D-Applied Physics": "Journal of Physics D: Applied Physics",
}

for group in works:
    for summary in group.get("work-summary", []):
        if summary.get("type") != "journal-article":
            continue
        title_data = (summary.get("title") or {}).get("title") or {}
        subtitle_data = (summary.get("title") or {}).get("subtitle") or {}
        title = (title_data.get("value") or "").strip()
        subtitle = (subtitle_data.get("value") or "").strip()
        if subtitle and subtitle.lower() not in title.lower():
            title = f"{title}: {subtitle}"
        year = (((summary.get("publication-date") or {}).get("year") or {}).get("value") or "Undated")
        journal = ((summary.get("journal-title") or {}).get("value") or "").strip()
        journal = journal_names.get(journal, journal)
        doi = ""
        for external_id in (summary.get("external-ids") or {}).get("external-id", []):
            if external_id.get("external-id-type", "").lower() == "doi":
                doi = external_id.get("external-id-value", "").strip()
                break
        doi = re.sub(r"^(?:https?://(?:dx\.)?doi\.org/|doi:\s*)", "", unquote(doi), flags=re.I).strip().casefold()
        key = ("doi", doi) if doi else ("title", year, re.sub(r"\W+", "", title.casefold()))
        if title and key not in seen:
            seen.add(key)
            rows.append({"year": year, "title": title, "journal": journal, "doi": doi})
            if doi:
                seen_dois.add(doi)

# These featured lab papers have publisher records but are not yet in ORCID.
supplemental_dois = [
    "10.1016/j.cej.2025.162098",
    "10.1002/advs.202411433",
    "10.1016/j.nantod.2025.102892",
]
for doi in supplemental_dois:
    if doi in seen_dois:
        continue
    metadata_request = Request(
        f"https://api.crossref.org/works/{doi}",
        headers={"User-Agent": "MicroNano-Biodevices-Laboratory/1.0"},
    )
    with urlopen(metadata_request, timeout=30) as response:
        metadata = json.load(response)["message"]
    if not any(author.get("ORCID", "").endswith("0000-0001-7450-6205") for author in metadata.get("author", [])):
        raise ValueError(f"Ming Li's authorship could not be verified for {doi}")
    publication_date = metadata.get("published-print") or metadata.get("published") or metadata.get("published-online")
    year = str(publication_date["date-parts"][0][0])
    title = unescape(re.sub(r"<[^>]+>", "", metadata["title"][0]))
    journal = metadata["container-title"][0]
    rows.append({"year": year, "title": title, "journal": journal_names.get(journal, journal), "doi": doi})
    seen_dois.add(doi)

scholar_supplement = Path(__file__).with_name("publications-scholar-supplement.json")
if scholar_supplement.exists():
    supplement = json.loads(scholar_supplement.read_text())
    for article in supplement["articles"]:
        doi = article["doi"].casefold()
        if doi not in seen_dois:
            rows.append({**article, "doi": doi})
            seen_dois.add(doi)
        else:
            for row in rows:
                if row["doi"] == doi:
                    row.update(article)
    excluded_dois = {article["doi"].casefold() for article in supplement.get("excluded", [])}
    rows = [row for row in rows if row["doi"] not in excluded_dois]

rows.sort(key=lambda row: (row["year"] == "Undated", -(int(row["year"]) if row["year"].isdigit() else 0), row["title"].casefold()))
target.write_text("window.ORCID_PUBLICATIONS = " + json.dumps(rows, ensure_ascii=False, indent=2) + ";\n")
print(f"Wrote {len(rows)} unique journal articles (ORCID, Scholar and verified publisher records) to {target}")
