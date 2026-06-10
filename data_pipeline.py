import pandas as pd
import numpy as np
import os

def load_and_clean_data(file_path):
    """
    Load the e-nose dataset, clean out metadata and invalid readings,
    handle duplicate columns, and drop completely empty records.
    """
    print(f"Loading data from: {file_path}")
    
    # 1. Skip the first row (the 'sep=,' metadata line) to get the correct headers
    df = pd.read_csv(file_path, skiprows=1)
    
    # 2. Convert Time column to datetime and sort by time to maintain order for lag features
    df['Time'] = pd.to_datetime(df['Time'])
    df = df.sort_values('Time').reset_index(drop=True)
    
    # 3. Drop Sensor 2 since it is a 100% identical duplicate of Sensor 1
    if 'Sensor 2' in df.columns:
        print("Dropping redundant 'Sensor 2' (identical to 'Sensor 1')...")
        df = df.drop(columns=['Sensor 2'])
        
    # 4. Identify numerical columns
    num_cols = df.select_dtypes(include=['float64', 'int64']).columns.tolist()
    
    # 5. Drop rows where all numerical columns are NaN (Offline gaps)
    print(f"Total rows before dropping offline records: {len(df)}")
    df = df.dropna(how='all', subset=num_cols)
    print(f"Total rows after dropping offline records: {len(df)}")
    
    # 6. Correct erroneous Atmospheric Pressure values (0.0 hPa is physically impossible)
    # Expected range: 500 to 1100 hPa. We replace 0.0 with NaN and forward fill.
    if 'Atmospheric Pressure' in df.columns:
        pressure_invalid = (df['Atmospheric Pressure'] < 500) | (df['Atmospheric Pressure'] > 1100)
        invalid_count = pressure_invalid.sum()
        if invalid_count > 0:
            print(f"Replacing {invalid_count} invalid Atmospheric Pressure values (< 500 hPa) with NaN and interpolating...")
            df.loc[pressure_invalid, 'Atmospheric Pressure'] = np.nan
            # Linearly interpolate missing pressure values, then backfill/forward fill any remaining
            df['Atmospheric Pressure'] = df['Atmospheric Pressure'].interpolate(method='linear').ffill().bfill()
            
    # 7. Forward fill the single remaining row that has NaN weather metrics
    weather_cols = ['Wind Direction', 'Wind Speed', 'Temperature', 'Relative Humidity', 'PM 2.5']
    df[weather_cols] = df[weather_cols].ffill().bfill()
    
    # 8. Handle 'Smell Prediction' missing values
    # As analyzed, NaN in Smell Prediction correlates with high D/T levels. 
    # We replace NaN with 'Odor_Event' and fix the typo 'hackathon#2' to 'Odor_Event'
    if 'Smell Prediction' in df.columns:
        df['Smell Prediction'] = df['Smell Prediction'].fillna('Odor_Event')
        df['Smell Prediction'] = df['Smell Prediction'].replace('hackathon#2', 'Odor_Event')
        
    return df

def engineer_features(df):
    """
    Apply feature engineering:
    - Wind vector components (u, v)
    - Temporal features (Hour, DayOfWeek, IsWeekend, Month)
    - Time lag features for target variable D/T
    """
    print("Engineering features...")
    
    # 1. Wind Vector Decomposition (u, v)
    # u component: West-to-East wind
    # v component: South-to-North wind
    # Converting Wind Direction from degrees to radians
    wind_dir_rad = np.radians(df['Wind Direction'])
    df['Wind_U'] = -df['Wind Speed'] * np.sin(wind_dir_rad)
    df['Wind_V'] = -df['Wind Speed'] * np.cos(wind_dir_rad)
    print("Created Wind_U and Wind_V wind vector components.")
    
    # 2. Temporal Features
    df['Hour'] = df['Time'].dt.hour
    df['DayOfWeek'] = df['Time'].dt.dayofweek
    df['IsWeekend'] = df['DayOfWeek'].isin([5, 6]).astype(int)
    df['Month'] = df['Time'].dt.month
    print("Created temporal features (Hour, DayOfWeek, IsWeekend, Month).")
    
    # 3. Time Lag Features for D/T (Odor Intensity)
    # Lags: 1 min, 5 min, 15 min, 30 min
    lags = [1, 5, 15, 30]
    for lag in lags:
        df[f'DT_lag_{lag}'] = df['D/T'].shift(lag)
        
    # Since shifting introduces NaNs at the beginning, we backfill the first lag rows
    lag_cols = [f'DT_lag_{lag}' for lag in lags]
    df[lag_cols] = df[lag_cols].bfill()
    print("Created D/T lag features (1, 5, 15, 30 minutes).")
    
    # 4. Odor Event Binary Class
    df['Is_Odor_Event'] = (df['Smell Prediction'] == 'Odor_Event').astype(int)
    
    return df

def main():
    raw_path = r'D:\My_server\University\3rd year\BootCamp\Hackathon\Work#2\Export.csv'
    processed_path = r'D:\My_server\University\3rd year\BootCamp\Hackathon\Work#2\Export_processed.csv'
    
    if not os.path.exists(raw_path):
        print(f"Error: Raw file not found at {raw_path}")
        return
        
    df = load_and_clean_data(raw_path)
    df_processed = engineer_features(df)
    
    print(f"Saving processed dataset to: {processed_path}")
    df_processed.to_csv(processed_path, index=False)
    print("Data processing pipeline complete!")
    print(f"Processed shape: {df_processed.shape}")
    print("Processed columns list:")
    print(df_processed.columns.tolist())
    
if __name__ == '__main__':
    main()
