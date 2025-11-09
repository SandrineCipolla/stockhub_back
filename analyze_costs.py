import json
from collections import defaultdict

def analyze_month(filename, month_name):
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)

    costs_by_category = defaultdict(float)
    costs_by_resource = defaultdict(float)
    total = 0

    for item in data:
        # Try different property paths
        if 'properties' in item:
            props = item['properties']
            category = props.get('meterCategory', 'Unknown')
            resource_name = props.get('instanceName', 'Unknown')

            # Try to get cost
            cost_str = props.get('pretaxCost', '0')
            if cost_str == 'None' or cost_str is None:
                cost = 0
            else:
                try:
                    cost = float(cost_str)
                except:
                    cost = 0

            if cost > 0:
                costs_by_category[category] += cost
                # Extract resource name
                if '/' in str(resource_name):
                    resource_parts = str(resource_name).split('/')
                    if len(resource_parts) > 0:
                        simple_name = resource_parts[-1]
                    else:
                        simple_name = str(resource_name)
                else:
                    simple_name = str(resource_name)
                costs_by_resource[simple_name] += cost
                total += cost

    print(f"\n{'='*70}")
    print(f"=== {month_name.upper()} ===")
    print(f"{'='*70}\n")

    print("Par catégorie de service:")
    print("-" * 70)
    for category, cost in sorted(costs_by_category.items(), key=lambda x: x[1], reverse=True):
        print(f"  {category:55s} : {cost:8.2f} €")

    print("\n" + "=" * 70)
    print(f"  {'TOTAL':55s} : {total:8.2f} €")
    print("=" * 70)

    if total == 0:
        print("\n⚠️  ATTENTION: Aucun coût détecté dans les données.")
        print("   Les données de coûts peuvent ne pas être encore disponibles via l'API.")

    return total, costs_by_category

# Analyze all months
august_total, august_costs = analyze_month('august_usage.json', 'Août 2025')
september_total, september_costs = analyze_month('september_usage.json', 'Septembre 2025')
october_total, october_costs = analyze_month('october_usage.json', 'Octobre 2025')

print("\n" + "="*70)
print("ÉVOLUTION DES COÛTS")
print("="*70)
print(f"Août      : {august_total:8.2f} €")
print(f"Septembre : {september_total:8.2f} €")
print(f"Octobre   : {october_total:8.2f} €")
print("="*70)
