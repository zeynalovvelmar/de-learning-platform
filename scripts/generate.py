import csv
import random
from datetime import datetime, timedelta
import os
import sys

def generate_data(output_dir):
    os.makedirs(output_dir, exist_ok=True)
    rng = random.Random(42)

    categories = []
    for i in range(1, 11):
        categories.append({
            'category_id': i,
            'category_name': f'Category {i}'
        })

    products = []
    prices_pool = [9.99, 19.99, 29.99, 49.99, 99.99]
    for i in range(1, 51):
        stock = rng.randint(0, 100) if rng.random() > 0.1 else None
        price = rng.choice(prices_pool)
        products.append({
            'product_id': i,
            'category_id': rng.randint(1, 8),
            'product_name': f'Product {i}',
            'price': price,
            'stock_quantity': stock
        })

    users = []
    countries = ['USA', 'UK', 'Canada', 'Germany', 'France', 'NA', None]
    base_emails = [f'user{i}@example.com' for i in range(1, 95)]
    emails = base_emails + ['user1@example.com', 'USER1@example.com', 'user2@example.com', 'USER2@example.com', 'user99@example.com', 'user100@example.com']
    
    start_date = datetime(2021, 1, 1)
    
    for i in range(1, 101):
        users.append({
            'user_id': i,
            'first_name': f'First{i}',
            'last_name': f'Last{i}',
            'email': emails[i-1],
            'country': rng.choice(countries),
            'created_at': (start_date + timedelta(days=rng.randint(0, 700))).strftime('%Y-%m-%d')
        })
        
    login_events = []
    for i in range(1, 2501):
        user_id = rng.randint(1, 100)
        login_events.append({
            'event_id': i,
            'user_id': user_id,
            'login_time': (start_date + timedelta(days=rng.randint(0, 700), hours=rng.randint(0, 23))).isoformat(),
            'ip_address': f'192.168.1.{rng.randint(1, 255)}'
        })

    orders = []
    order_items = []
    item_id_counter = 1
    order_start = datetime(2022, 1, 1)
    
    order_user_assignment = [1]*6 + [2]*6 + [3]*6
    while len(order_user_assignment) < 500:
        order_user_assignment.append(rng.randint(1, 89))
    rng.shuffle(order_user_assignment)
    
    statuses = ['completed', 'cancelled', 'refunded']
    
    for i in range(1, 501):
        user_id = order_user_assignment[i-1]
        order_date = order_start + timedelta(days=rng.randint(0, 729))
        status = rng.choices(statuses, weights=[0.8, 0.1, 0.1])[0]
        
        num_items = rng.randint(1, 4)
        order_items_for_this = []
        
        if i == 10:
            prod_id = rng.randint(1, 48)
            price = products[prod_id-1]['price']
            order_items_for_this.append({'item_id': item_id_counter, 'order_id': i, 'product_id': prod_id, 'quantity': 1, 'unit_price': price})
            item_id_counter += 1
            order_items_for_this.append({'item_id': item_id_counter, 'order_id': i, 'product_id': prod_id, 'quantity': 2, 'unit_price': price})
            item_id_counter += 1
        else:
            for _ in range(num_items):
                prod_id = rng.randint(1, 48)
                price = products[prod_id-1]['price']
                qty = rng.randint(1, 3)
                order_items_for_this.append({'item_id': item_id_counter, 'order_id': i, 'product_id': prod_id, 'quantity': qty, 'unit_price': price})
                item_id_counter += 1
                
        total_amount = round(sum(item['quantity'] * item['unit_price'] for item in order_items_for_this), 2)
        order_items.extend(order_items_for_this)
        
        orders.append({
            'order_id': i,
            'user_id': user_id,
            'order_date': order_date.strftime('%Y-%m-%d'),
            'status': status,
            'total_amount': total_amount
        })
        
    def write_csv(filename, data, fieldnames):
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for row in data:
                csv_row = {k: ('' if v is None else v) for k, v in row.items()}
                writer.writerow(csv_row)
                
    write_csv('categories.csv', categories, ['category_id', 'category_name'])
    write_csv('products.csv', products, ['product_id', 'category_id', 'product_name', 'price', 'stock_quantity'])
    write_csv('users.csv', users, ['user_id', 'first_name', 'last_name', 'email', 'country', 'created_at'])
    write_csv('login_events.csv', login_events, ['event_id', 'user_id', 'login_time', 'ip_address'])
    write_csv('orders.csv', orders, ['order_id', 'user_id', 'order_date', 'status', 'total_amount'])
    write_csv('order_items.csv', order_items, ['item_id', 'order_id', 'product_id', 'quantity', 'unit_price'])

if __name__ == '__main__':
    out_dir = sys.argv[1] if len(sys.argv) > 1 else 'data/datasets'
    generate_data(out_dir)
