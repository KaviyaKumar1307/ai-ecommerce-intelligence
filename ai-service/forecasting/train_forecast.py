"""
Offline Model Training Script for Sales Forecasting
Can be run via: python train_forecast.py
"""
import sys
import os
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from forecasting.forecast_model import SalesForecaster

def run_offline_training():
    print("[Forecasting Pipeline] Initializing model training...")

    # Load sample historical sales if available or generate baseline
    data_file = os.path.join(os.path.dirname(__file__), '../data/historical_sales.json')
    if os.path.exists(data_file):
        with open(data_file, 'r') as f:
            sales_data = json.load(f)
    else:
        # Default 182-day realistic synthetic series matching database seed
        from datetime import datetime, timedelta
        import math
        start_date = datetime(2026, 4, 1)
        sales_data = []
        for i in range(182):
            cur = start_date + timedelta(days=i)
            dow = cur.weekday()
            mult = 1.45 if dow in [5, 6] else (1.2 if dow == 4 else 1.0)
            base = 140000 + i * 950
            total_sales = round(base * mult + math.sin(i * 0.3) * 12000, 2)
            sales_data.append({
                "date": cur.strftime('%Y-%m-%d'),
                "total_sales": total_sales,
                "total_orders": int(total_sales / 8200),
                "total_units": int(total_sales / 5800)
            })

    forecaster = SalesForecaster(model_version="1.0.0")
    report = forecaster.train(sales_data)

    print("=======================================================")
    print("[SUCCESS] Model Training Complete!")
    print(f"Algorithm:       {report.get('model')}")
    print(f"Version:         {report.get('version')}")
    print(f"Trained At:      {report.get('trained_at')}")
    print(f"Mean Abs Error:  INR {report.get('metrics', {}).get('mae'):,.2f}")
    print(f"RMSE:            INR {report.get('metrics', {}).get('rmse'):,.2f}")
    print(f"R^2 Score:       {report.get('metrics', {}).get('r2')}")
    print("=======================================================")

if __name__ == '__main__':
    run_offline_training()
