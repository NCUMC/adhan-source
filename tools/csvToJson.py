#!/usr/bin/env python3
"""
CSV to JSON Converter Script - Nested Structure

This script converts CSV files to nested JSON format specifically for prayer times:
- Groups data by month
- Each month contains an array of days
- Each day contains prayer time data
- Removes month/day values from the final objects

Usage:
    python csvToJson.py input.csv output.json
    python csvToJson.py input.csv output.json --preview
"""

import csv
import json
import argparse
import sys
from pathlib import Path
from typing import List, Dict, Any


def csv_to_nested_json(csv_file_path: str, delimiter: str = ',', encoding: str = 'utf-8') -> List[List[Dict[str, Any]]]:
    """
    Convert CSV to nested JSON structure for prayer times.
    
    Args:
        csv_file_path: Path to the CSV file
        delimiter: CSV delimiter (default: comma)
        encoding: File encoding (default: utf-8)
    
    Returns:
        List of months, where each month is a list of days with prayer times
    """
    months_data = []
    current_month = []
    
    try:
        with open(csv_file_path, 'r', encoding=encoding) as csvfile:
            reader = csv.DictReader(csvfile, delimiter=delimiter)
            
            for row in reader:
                # Clean up the row data
                cleaned_row = {}
                for key, value in row.items():
                    if value is not None and value.strip() != '':
                        cleaned_row[key.strip()] = value.strip()
                
                # Check if this is a new month (Month field is not empty)
                if cleaned_row.get('Month') and cleaned_row['Month'].strip():
                    # If we have data from previous month, save it
                    if current_month:
                        months_data.append(current_month)
                    # Start new month
                    current_month = []
                
                # Create prayer time object (excluding Month and Days)
                prayer_times = {}
                for key, value in cleaned_row.items():
                    if key not in ['Month', 'Days']:
                        prayer_times[key] = value
                
                # Add to current month if we have prayer times
                if prayer_times:
                    current_month.append(prayer_times)
            
            # Don't forget the last month
            if current_month:
                months_data.append(current_month)
                
    except FileNotFoundError:
        print(f"Error: File '{csv_file_path}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        sys.exit(1)
    
    return months_data


def save_json(data: List[List[Dict]], output_path: str, indent: int = 2, encoding: str = 'utf-8') -> None:
    """
    Save nested data to JSON file.
    
    Args:
        data: Nested data structure (months -> days -> prayer times)
        output_path: Path to output JSON file
        indent: JSON indentation (default: 2)
        encoding: File encoding (default: utf-8)
    """
    try:
        with open(output_path, 'w', encoding=encoding) as jsonfile:
            json.dump(data, jsonfile, indent=indent, ensure_ascii=False)
        print(f"Successfully converted CSV to nested JSON: {output_path}")
    except Exception as e:
        print(f"Error writing JSON file: {e}")
        sys.exit(1)


def preview_csv(csv_file_path: str, delimiter: str = ',', encoding: str = 'utf-8', num_rows: int = 10) -> None:
    """
    Preview the CSV file structure.
    
    Args:
        csv_file_path: Path to the CSV file
        delimiter: CSV delimiter (default: comma)
        encoding: File encoding (default: utf-8)
        num_rows: Number of rows to preview (default: 10)
    """
    try:
        with open(csv_file_path, 'r', encoding=encoding) as csvfile:
            reader = csv.reader(csvfile, delimiter=delimiter)
            headers = next(reader)
            print(f"Headers: {headers}")
            print(f"Preview of first {num_rows} rows:")
            print("-" * 60)
            
            for i, row in enumerate(reader):
                if i >= num_rows:
                    break
                print(f"Row {i+1}: {row}")
                
        print("\nExpected structure:")
        print("Month 1: [Day1_prayers, Day2_prayers, Day3_prayers]")
        print("Month 2: [Day1_prayers, Day2_prayers, Day3_prayers]")
        print("...")
        
    except Exception as e:
        print(f"Error previewing CSV file: {e}")


def main():
    parser = argparse.ArgumentParser(
        description='Convert CSV prayer times to nested JSON format',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python csvToJson.py CMA_Adhan_TimeTable.csv timetable.json
  python csvToJson.py CMA_Adhan_TimeTable.csv timetable.json --preview
  python csvToJson.py CMA_Adhan_TimeTable.csv timetable.json --delimiter comma
        """
    )
    
    parser.add_argument('input_file', help='Input CSV file path')
    parser.add_argument('output_file', help='Output JSON file path')
    parser.add_argument('--delimiter', default=',', help='CSV delimiter (default: comma)')
    parser.add_argument('--encoding', default='utf-8', help='File encoding (default: utf-8)')
    parser.add_argument('--indent', type=int, default=2, help='JSON indentation (default: 2)')
    parser.add_argument('--preview', action='store_true', help='Preview CSV before conversion')
    
    args = parser.parse_args()
    
    # Check if input file exists
    if not Path(args.input_file).exists():
        print(f"Error: Input file '{args.input_file}' does not exist.")
        sys.exit(1)
    
    # Preview if requested
    if args.preview:
        print("CSV Preview:")
        preview_csv(args.input_file, args.delimiter, args.encoding)
        print("\n" + "="*60 + "\n")
    
    # Convert to nested structure
    data = csv_to_nested_json(args.input_file, args.delimiter, args.encoding)
    
    # Save to JSON
    save_json(data, args.output_file, args.indent, args.encoding)
    
    # Print summary
    print(f"Converted to nested JSON structure:")
    print(f"- {len(data)} months")
    for i, month in enumerate(data, 1):
        print(f"- Month {i}: {len(month)} days")
    
    # Show sample of first month
    if data and data[0]:
        print(f"\nSample of first month, first day:")
        print(json.dumps(data[0][0], indent=2))


if __name__ == "__main__":
    main()
