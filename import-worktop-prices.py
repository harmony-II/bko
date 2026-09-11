import json
import re
import urllib.request
from pathlib import Path

root = Path(__file__).parent
product_dir = root / 'assets' / 'images' / 'worktops' / 'products'
output_file = root / 'assets' / 'data' / 'worktop-prices.js'
files = [path for path in product_dir.glob('*.webp') if not re.search(r'fenix|shadow-marble', path.name, re.I)]
url_aliases = {
    'dark-oak-luxury-laminate-worktops': 'dark-oak-laminate-worktops',
    'woodland-oak-luxury-laminate-worktops': 'woodland-oak-laminate-worktops',
    'rustic-wood-luxury-laminate-worktops': 'rustic-wood-laminate-worktops'
}

def slug_from_file(path):
    return path.stem.lower()

def title_from_slug(slug):
    return ' '.join(word.capitalize() for word in re.sub(r'-worktops?$', '', slug).split('-')) + ' Worktops'

def parse_variants(html):
    variants = []
    pattern = re.compile(r'"sku"\s*:\s*"([^"]+)"[\s\S]{0,1500}?"size"\s*:\s*"([^"]+)"[\s\S]{0,1500}?"price"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)"?')
    for sku, size, raw_price in pattern.findall(html):
        if sku.endswith('-RANGE'):
            continue
        if not any(item['sku'] == sku for item in variants):
            variants.append({'sku': sku, 'size': size.strip(), 'price': float(raw_price)})
    return variants

def parse_specs(html):
    specs = []
    row_pattern = re.compile(r'<tr[^>]*data-spec="[^"]+"[^>]*>[\s\S]*?<td[^>]*>\s*([^<]+?)\s*</td>[\s\S]*?<td[^>]*>\s*([\s\S]*?)\s*</td>\s*</tr>', re.I)
    for label, value in row_pattern.findall(html):
        clean_value = re.sub(r'<[^>]+>', ' ', value)
        clean_value = re.sub(r'\s+', ' ', clean_value).strip()
        if clean_value and not any(item[0] == label.strip() for item in specs):
            specs.append([label.strip(), clean_value])
    return specs

prices = {}
for path in files:
    slug = slug_from_file(path)
    url_slug = url_aliases.get(slug, slug)
    url = 'https://www.worktop-express.co.uk/{}/'.format(url_slug)
    try:
        request = urllib.request.Request(url, headers={'User-Agent': 'Buy Kitchens Online product data importer'})
        with urllib.request.urlopen(request, timeout=20) as response:
            html = response.read().decode('utf-8', 'ignore')
            variants = parse_variants(html)
            specifications = parse_specs(html)
        if variants:
            prices[slug] = {'title': title_from_slug(slug), 'source': url, 'specifications': specifications, 'variants': variants}
    except Exception as error:
        print('Skipped {}: {}'.format(slug, error))

output_file.write_text('window.BKO_WORKTOP_PRICES = {};\n'.format(json.dumps(prices, indent=2)), encoding='utf-8')
print('Imported {} product price tables.'.format(len(prices)))
