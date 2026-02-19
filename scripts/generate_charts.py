#!/usr/bin/env python3
"""
Tax Planning - Chart Generator
Generates comprehensive comparative tax charts for US, Indonesia, Canada, Brazil, Mexico, Australia, and Singapore.
Outputs PNG files to the charts/ directory.
"""

import json
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CHARTS_DIR = BASE_DIR / "charts"
CHARTS_DIR.mkdir(exist_ok=True)

# Style
plt.style.use('seaborn-v0_8-whitegrid')
COLORS = {
    'US': '#1f77b4',
    'Indonesia': '#ff7f0e',
    'Canada': '#d62728',
    'Brazil': '#2ca02c',
    'Mexico': '#9467bd',
    'Australia': '#8c564b',
    'Singapore': '#e377c2'
}
COUNTRY_ORDER = ['US', 'Indonesia', 'Canada', 'Brazil', 'Mexico', 'Australia', 'Singapore']
COUNTRY_LABELS = ['United States', 'Indonesia', 'Canada', 'Brazil', 'Mexico', 'Australia', 'Singapore']


def load_data():
    """Load all country JSON data files."""
    data = {}
    for filename in ['us.json', 'indonesia.json', 'canada.json', 'brazil.json', 'mexico.json', 'australia.json', 'singapore.json']:
        filepath = DATA_DIR / filename
        with open(filepath) as f:
            d = json.load(f)
            data[d['country_code']] = d
    return data


def chart_1_corporate_tax_rates(data):
    """Chart 1: Corporate Tax Rate Comparison (Standard Rates)."""
    fig, ax = plt.subplots(figsize=(14, 7))

    countries = COUNTRY_LABELS
    codes = COUNTRY_ORDER

    # Standard corporate rates
    rates = [
        data['US']['corporate_tax']['federal_rate'],          # US federal
        data['ID']['corporate_tax']['standard_rate'],          # Indonesia
        data['CA']['corporate_tax']['federal_general_rate'],   # Canada federal
        data['BR']['corporate_tax']['lucro_real']['combined_effective']['above_240k'],  # Brazil
        data['MX']['corporate_tax']['standard_rate'],          # Mexico
        data['AU']['corporate_tax']['general_rate'],           # Australia
        data['SG']['corporate_tax']['headline_rate'],          # Singapore
    ]

    # SME / lower rates
    sme_rates = [
        data['US']['corporate_tax']['federal_rate'],           # US flat (no SME break at federal)
        data['ID']['corporate_tax']['sme_regimes']['article_31e_reduction']['effective_rate_on_portion'],  # Indonesia 11%
        data['CA']['corporate_tax']['federal_small_business_rate'],  # Canada 9%
        data['BR']['corporate_tax']['lucro_real']['combined_effective']['below_240k'],  # Brazil 24%
        data['MX']['corporate_tax']['standard_rate'],          # Mexico flat 30%
        data['AU']['corporate_tax']['base_rate_entity_rate'],  # Australia 25%
        data['SG']['corporate_tax']['startup_tax_exemption']['first_100k']['effective_rate'],  # Singapore SUTE 4.25%
    ]

    x = np.arange(len(countries))
    width = 0.35

    bars1 = ax.bar(x - width/2, rates, width, label='Standard / General Rate',
                   color=[COLORS[c] for c in codes], alpha=0.9, edgecolor='white', linewidth=0.8)
    bars2 = ax.bar(x + width/2, sme_rates, width, label='SME / Reduced Rate',
                   color=[COLORS[c] for c in codes], alpha=0.5, edgecolor='white', linewidth=0.8,
                   hatch='///')

    # Value labels
    for bar in bars1:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.5,
                f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=9, fontweight='bold')
    for bar in bars2:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.5,
                f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=9)

    ax.set_ylabel('Tax Rate (%)', fontsize=12)
    ax.set_title('Corporate Income Tax Rates Comparison (2024/2025)\nStandard vs. SME / Reduced Rates', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(countries, fontsize=9)
    ax.legend(fontsize=10, loc='upper right')
    ax.set_ylim(0, 42)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '01_corporate_tax_rates.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 01_corporate_tax_rates.png")


def chart_2_combined_federal_state(data):
    """Chart 2: Combined Federal + State/Provincial Rates."""
    fig, ax = plt.subplots(figsize=(16, 7))

    labels = []
    rates_low = []

    # US
    labels.append('US\n(Fed only)')
    rates_low.append(21.0)
    labels.append('US\n(Fed+CA)')
    rates_low.append(27.9)
    labels.append('US\n(Fed+NJ)')
    rates_low.append(30.4)

    # Indonesia
    labels.append('Indonesia\n(Standard)')
    rates_low.append(22.0)
    labels.append('Indonesia\n(Listed Co.)')
    rates_low.append(19.0)

    # Canada
    labels.append('Canada\n(Fed+AB)')
    rates_low.append(23.0)
    labels.append('Canada\n(Fed+ON)')
    rates_low.append(26.5)
    labels.append('Canada\n(Fed+PEI)')
    rates_low.append(31.0)

    # Brazil
    labels.append('Brazil\n(Lucro Real)')
    rates_low.append(34.0)
    labels.append('Brazil\n(Fin. Inst.)')
    rates_low.append(40.0)

    # Mexico
    labels.append('Mexico\n(Standard)')
    rates_low.append(30.0)
    labels.append('Mexico\n(Border)')
    rates_low.append(20.0)

    # Australia
    labels.append('Australia\n(General)')
    rates_low.append(30.0)
    labels.append('Australia\n(Base Rate)')
    rates_low.append(25.0)

    # Singapore
    labels.append('Singapore\n(Standard)')
    rates_low.append(17.0)
    labels.append('Singapore\n(Pioneer)')
    rates_low.append(5.0)

    color_map = (['#1f77b4']*3 + ['#ff7f0e']*2 + ['#d62728']*3 + ['#2ca02c']*2
                 + ['#9467bd']*2 + ['#8c564b']*2 + ['#e377c2']*2)

    x = np.arange(len(labels))
    bars = ax.bar(x, rates_low, 0.6, color=color_map, alpha=0.85, edgecolor='white', linewidth=0.8)

    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.3,
                f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=7, fontweight='bold')

    ax.set_ylabel('Combined Tax Rate (%)', fontsize=12)
    ax.set_title('Combined Federal + State/Provincial Corporate Tax Rates\nVarious Scenarios (2024/2025)', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=7, rotation=0)
    ax.set_ylim(0, 48)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())

    # Add average line
    avg = np.mean(rates_low)
    ax.axhline(y=avg, color='gray', linestyle='--', alpha=0.7, label=f'Average: {avg:.1f}%')
    ax.legend(fontsize=10)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '02_combined_federal_state_rates.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 02_combined_federal_state_rates.png")


def chart_3_vat_gst_rates(data):
    """Chart 3: VAT/GST/Sales Tax Rates."""
    fig, ax = plt.subplots(figsize=(14, 7))

    countries = COUNTRY_LABELS
    codes = COUNTRY_ORDER

    standard_rates = [
        0,     # US - no federal VAT
        11.0,  # Indonesia PPN
        5.0,   # Canada GST (federal)
        9.25,  # Brazil PIS+COFINS (non-cumulative)
        16.0,  # Mexico IVA
        10.0,  # Australia GST
        9.0,   # Singapore GST
    ]

    max_combined = [
        10.25,  # US - max state sales tax
        12.0,   # Indonesia - planned 2025
        15.0,   # Canada - HST provinces
        26.5,   # Brazil - estimated CBS+IBS reform
        16.0,   # Mexico - standard
        10.0,   # Australia - GST only
        9.0,    # Singapore - single rate
    ]

    x = np.arange(len(countries))
    width = 0.35

    bars1 = ax.bar(x - width/2, standard_rates, width, label='Standard Federal Rate',
                   color=[COLORS[c] for c in codes], alpha=0.9, edgecolor='white')
    bars2 = ax.bar(x + width/2, max_combined, width, label='Maximum Combined / Reformed Rate',
                   color=[COLORS[c] for c in codes], alpha=0.5, edgecolor='white', hatch='xxx')

    for bar in bars1:
        h = bar.get_height()
        label = 'N/A' if h == 0 else f'{h:.1f}%'
        ax.text(bar.get_x() + bar.get_width()/2., max(h, 0) + 0.3,
                label, ha='center', va='bottom', fontsize=8, fontweight='bold')
    for bar in bars2:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.3,
                f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=8)

    ax.set_ylabel('Rate (%)', fontsize=12)
    ax.set_title('VAT / GST / Sales Tax Rate Comparison (2024/2025)', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(countries, fontsize=9)
    ax.legend(fontsize=10)
    ax.set_ylim(0, 32)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())

    ax.annotate('No federal VAT\n(state sales tax only)', xy=(0, 0.5), fontsize=7,
                ha='center', style='italic', color='gray')

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '03_vat_gst_rates.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 03_vat_gst_rates.png")


def chart_4_employer_payroll_burden(data):
    """Chart 4: Total Employer Payroll Tax Burden."""
    fig, ax = plt.subplots(figsize=(12, 7))

    countries = COUNTRY_LABELS
    codes = COUNTRY_ORDER

    # Approximate total employer payroll burden (% of payroll)
    burdens = [
        7.65,   # US: SS 6.2% + Medicare 1.45%
        11.0,   # Indonesia: BPJS total ~10-12%
        8.3,    # Canada: CPP 5.95% + EI 2.324%
        35.8,   # Brazil: INSS 20% + RAT 2% + Terceiros 5.8% + FGTS 8%
        30.0,   # Mexico: IMSS ~25-35% (mid)
        11.5,   # Australia: Super 11.5% (main employer contribution)
        17.25,  # Singapore: CPF 17% + SDL 0.25%
    ]

    x = np.arange(len(countries))
    bars = ax.barh(x, burdens, 0.55, color=[COLORS[c] for c in codes], alpha=0.85, edgecolor='white')

    for bar in bars:
        ax.text(bar.get_width() + 0.5, bar.get_y() + bar.get_height()/2.,
                f'{bar.get_width():.1f}%', ha='left', va='center', fontsize=10, fontweight='bold')

    ax.set_xlabel('Approximate Employer Burden (% of Payroll)', fontsize=12)
    ax.set_title('Total Employer Payroll Tax / Social Security Burden\n(Approximate % of Payroll, 2024/2025)', fontsize=14, fontweight='bold')
    ax.set_yticks(x)
    ax.set_yticklabels(countries, fontsize=11)
    ax.set_xlim(0, 45)
    ax.xaxis.set_major_formatter(mticker.PercentFormatter())
    ax.invert_yaxis()

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '04_employer_payroll_burden.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 04_employer_payroll_burden.png")


def chart_5_depreciation_comparison(data):
    """Chart 5: Depreciation Rates for Common Asset Types."""
    fig, axes = plt.subplots(2, 3, figsize=(20, 11))

    asset_types = ['Buildings', 'Vehicles', 'Computers', 'Machinery\n(General)', 'Furniture', 'Software']

    # Rates per country per asset (annual %)
    # Format: [US, Indonesia, Canada, Brazil, Mexico, Australia, Singapore]
    rates = {
        'Buildings':           [2.56, 5.0, 4.0, 4.0, 5.0, 2.5, 3.0],      # SG: IBA initial 25% + 3%/yr -> ~3% annual avg
        'Vehicles':            [20.0, 12.5, 30.0, 20.0, 25.0, 12.5, 33.3], # SG: 3-year write-off
        'Computers':           [20.0, 25.0, 55.0, 20.0, 30.0, 25.0, 100.0],# SG: 1-year accelerated
        'Machinery\n(General)': [14.29, 12.5, 30.0, 10.0, 10.0, 10.0, 33.3],# SG: 3-year write-off
        'Furniture':           [14.29, 12.5, 20.0, 10.0, 10.0, 10.0, 33.3], # SG: 3-year write-off
        'Software':            [20.0, 25.0, 100.0, 20.0, 30.0, 20.0, 100.0],# SG: 1-year accelerated
    }

    for idx, (asset, ax) in enumerate(zip(asset_types, axes.flat)):
        vals = rates[asset]
        x = np.arange(len(COUNTRY_ORDER))
        bars = ax.bar(x, vals, 0.6, color=[COLORS[c] for c in COUNTRY_ORDER], alpha=0.85, edgecolor='white')

        for bar in bars:
            ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.5,
                    f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=7, fontweight='bold')

        ax.set_title(asset, fontsize=12, fontweight='bold')
        ax.set_xticks(x)
        ax.set_xticklabels(COUNTRY_ORDER, fontsize=7)
        ax.set_ylim(0, max(vals) * 1.25)
        ax.yaxis.set_major_formatter(mticker.PercentFormatter())
        ax.set_ylabel('Annual Rate %', fontsize=9)

    fig.suptitle('Annual Depreciation / Capital Allowance Rates by Asset Type & Country (2024/2025)',
                 fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '05_depreciation_comparison.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 05_depreciation_comparison.png")


def chart_6_nol_rules(data):
    """Chart 6: Net Operating Loss (NOL) Rules Comparison."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))

    countries = COUNTRY_ORDER

    # Carry-forward years (use 25 for "indefinite")
    cf_years = [25, 5, 20, 25, 10, 25, 25]  # SG=indefinite
    cf_labels = ['Indef.', '5 yrs', '20 yrs', 'Indef.', '10 yrs', 'Indef.', 'Indef.']

    # Carry-back years
    cb_years = [0, 0, 3, 0, 0, 1, 1]  # SG=1 (capped at S$100K)

    # Annual limitation %
    limits = [80, 100, 100, 30, 100, 100, 100]  # SG=100%

    x = np.arange(len(countries))

    # Chart A - Carry forward & back
    bars_cf = ax1.bar(x - 0.2, cf_years, 0.35, label='Carry-Forward (years)',
                      color=[COLORS[c] for c in countries], alpha=0.85, edgecolor='white')
    bars_cb = ax1.bar(x + 0.2, cb_years, 0.35, label='Carry-Back (years)',
                      color=[COLORS[c] for c in countries], alpha=0.4, edgecolor='white', hatch='///')

    for bar, lbl in zip(bars_cf, cf_labels):
        ax1.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.3,
                lbl, ha='center', va='bottom', fontsize=8, fontweight='bold')
    for bar in bars_cb:
        val = bar.get_height()
        if val > 0:
            ax1.text(bar.get_x() + bar.get_width()/2., val + 0.3,
                    f'{int(val)}', ha='center', va='bottom', fontsize=8)
        else:
            ax1.text(bar.get_x() + bar.get_width()/2., 0.3,
                    'No', ha='center', va='bottom', fontsize=7, color='gray')

    ax1.set_ylabel('Years', fontsize=12)
    ax1.set_title('NOL Carry-Forward & Carry-Back', fontsize=13, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(countries, fontsize=9)
    ax1.legend(fontsize=9)
    ax1.set_ylim(0, 30)

    # Chart B - Annual limitation
    bars_lim = ax2.bar(x, limits, 0.5, color=[COLORS[c] for c in countries], alpha=0.85, edgecolor='white')
    for bar in bars_lim:
        ax2.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 1,
                f'{int(bar.get_height())}%', ha='center', va='bottom', fontsize=10, fontweight='bold')

    ax2.set_ylabel('Maximum % of Taxable Income', fontsize=12)
    ax2.set_title('Annual NOL Utilization Limit', fontsize=13, fontweight='bold')
    ax2.set_xticks(x)
    ax2.set_xticklabels(countries, fontsize=9)
    ax2.set_ylim(0, 120)
    ax2.yaxis.set_major_formatter(mticker.PercentFormatter())

    fig.suptitle('Net Operating Loss (NOL) Rules Comparison (2024/2025)',
                 fontsize=15, fontweight='bold')
    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '06_nol_rules.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 06_nol_rules.png")


def chart_7_rnd_incentives(data):
    """Chart 7: R&D Tax Incentive Comparison."""
    fig, ax = plt.subplots(figsize=(16, 8))

    categories = [
        'R&D Credit/Offset Rate\n(Standard)',
        'R&D Credit/Offset Rate\n(Enhanced/SME)',
        'Super Deduction\n(Max Extra %)',
        'Carry-Forward\n(Years)'
    ]

    # Data: [US, Indonesia, Canada, Brazil, Mexico, Australia, Singapore]
    rnd_data = {
        'US':        [20, 20, 0, 20],       # 20% credit, same for SME (ASC 14%), no super deduction, 20yr CF
        'Indonesia': [0, 0, 200, 5],         # No direct credit, super deduction up to 300% (200% extra), 5yr losses
        'Canada':    [15, 35, 0, 20],        # 15% general, 35% CCPC, no super deduction, 20yr CF
        'Brazil':    [0, 0, 80, 999],        # No credit (deduction-based), up to 80% extra, indefinite losses
        'Mexico':    [30, 30, 0, 10],        # 30% incremental credit, same, no super deduction, 10yr CF
        'Australia': [38.5, 48.5, 0, 999],   # 38.5% non-refundable offset, 48.5% refundable, no super deduction
        'Singapore': [0, 0, 300, 999],       # No direct credit, EIS 400% (300% extra) on qualifying R&D, indefinite CF
    }

    x = np.arange(len(categories))
    n_countries = len(COUNTRY_ORDER)
    width = 0.11
    offsets = np.arange(n_countries) * width - ((n_countries - 1) * width / 2)

    for i, (code, label) in enumerate(zip(COUNTRY_ORDER, COUNTRY_LABELS)):
        vals = rnd_data[code]
        display_vals = [v if v < 900 else 0 for v in vals]
        bars = ax.bar(x + offsets[i], display_vals, width, label=label,
                      color=COLORS[code], alpha=0.85, edgecolor='white')
        for j, bar in enumerate(bars):
            v = vals[j]
            if v == 999:
                label_text = 'Indef.'
            elif v == 0:
                label_text = 'N/A'
            else:
                label_text = f'{v}%' if j < 3 else f'{v}'
            if v > 0:
                ax.text(bar.get_x() + bar.get_width()/2.,
                        max(bar.get_height(), 0) + 1.5,
                        label_text, ha='center', va='bottom', fontsize=6, rotation=45)

    ax.set_ylabel('Rate / Value', fontsize=12)
    ax.set_title('R&D Tax Incentive Comparison Across Countries (2024/2025)', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontsize=10)
    ax.legend(fontsize=8, loc='upper right', ncol=2)
    ax.set_ylim(0, 320)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '07_rnd_incentives.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 07_rnd_incentives.png")


def chart_8_interest_limitation(data):
    """Chart 8: Interest Deduction Limitation Rules."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))

    countries = COUNTRY_ORDER

    # EBITDA-based limitation (%)
    ebitda_limits = [30, 0, 30, 0, 30, 30, 0]  # SG: no EBITDA limit (arm's length only)

    # Debt-to-Equity Ratio
    der_ratios = [0, 4, 0, 2, 3, 0, 0]  # SG: no statutory DER
    der_labels = ['N/A\n(EBITDA)', '4:1', 'N/A\n(EIFEL)', '2:1', '3:1', 'N/A\n(60% assets)', "N/A\n(Arm's\nlength)"]

    x = np.arange(len(countries))

    # Chart A - EBITDA Limitation
    colors_a = [COLORS[c] if ebitda_limits[i] > 0 else '#cccccc' for i, c in enumerate(countries)]
    bars1 = ax1.bar(x, ebitda_limits, 0.5, color=colors_a, alpha=0.85, edgecolor='white')
    for i, bar in enumerate(bars1):
        val = ebitda_limits[i]
        if val > 0:
            label = f'{val}%'
        elif countries[i] == 'Singapore':
            label = "Arm's length"
        else:
            label = 'DER-based'
        ax1.text(bar.get_x() + bar.get_width()/2., max(val, 0) + 0.5,
                label, ha='center', va='bottom', fontsize=9, fontweight='bold')

    ax1.set_ylabel('% of EBITDA', fontsize=12)
    ax1.set_title('EBITDA-Based Interest Limitation', fontsize=13, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(countries, fontsize=9)
    ax1.set_ylim(0, 40)

    # Chart B - DER
    colors_b = [COLORS[c] if der_ratios[i] > 0 else '#cccccc' for i, c in enumerate(countries)]
    bars2 = ax2.bar(x, der_ratios, 0.5, color=colors_b, alpha=0.85, edgecolor='white')
    for i, bar in enumerate(bars2):
        ax2.text(bar.get_x() + bar.get_width()/2., max(der_ratios[i], 0) + 0.1,
                der_labels[i], ha='center', va='bottom', fontsize=8, fontweight='bold')

    ax2.set_ylabel('Debt-to-Equity Ratio', fontsize=12)
    ax2.set_title('Thin Capitalization / DER Rules', fontsize=13, fontweight='bold')
    ax2.set_xticks(x)
    ax2.set_xticklabels(countries, fontsize=9)
    ax2.set_ylim(0, 6)

    fig.suptitle('Interest Deduction Limitation Rules (2024/2025)', fontsize=15, fontweight='bold')
    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '08_interest_limitation.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 08_interest_limitation.png")


def chart_9_withholding_taxes(data):
    """Chart 9: Withholding Tax Rates on Non-Resident Payments."""
    fig, axes = plt.subplots(1, 3, figsize=(18, 7))

    countries = COUNTRY_ORDER
    payment_types = ['Dividends', 'Interest', 'Royalties']

    default_rates = {
        'Dividends': [30, 20, 25, 0, 10, 30, 0],       # SG: 0% (one-tier system)
        'Interest':  [30, 20, 25, 15, 35, 10, 15],      # SG: 15%
        'Royalties': [30, 20, 25, 15, 25, 30, 10],      # SG: 10%
    }

    treaty_rates = {
        'Dividends': [15, 10, 15, 0, 10, 15, 0],        # SG: 0% (no WHT on dividends)
        'Interest':  [10, 10, 0, 15, 4.9, 10, 5],       # SG: ~5% common treaty
        'Royalties': [10, 10, 10, 15, 10, 5, 5],         # SG: ~5% common treaty
    }

    for idx, (ptype, ax) in enumerate(zip(payment_types, axes)):
        x = np.arange(len(countries))
        width = 0.35

        bars1 = ax.bar(x - width/2, default_rates[ptype], width, label='Default (No Treaty)',
                       color=[COLORS[c] for c in countries], alpha=0.85, edgecolor='white')
        bars2 = ax.bar(x + width/2, treaty_rates[ptype], width, label='Common Treaty Rate',
                       color=[COLORS[c] for c in countries], alpha=0.4, edgecolor='white', hatch='///')

        for bar in bars1:
            ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.3,
                    f'{bar.get_height():.0f}%', ha='center', va='bottom', fontsize=7, fontweight='bold')
        for bar in bars2:
            ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.3,
                    f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=7)

        ax.set_title(ptype, fontsize=13, fontweight='bold')
        ax.set_xticks(x)
        ax.set_xticklabels(countries, fontsize=7, rotation=15)
        ax.set_ylim(0, 40)
        ax.yaxis.set_major_formatter(mticker.PercentFormatter())
        if idx == 0:
            ax.set_ylabel('WHT Rate (%)', fontsize=11)
            ax.legend(fontsize=8)

    fig.suptitle('Withholding Tax Rates on Non-Resident Payments (2024/2025)',
                 fontsize=15, fontweight='bold')
    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '09_withholding_taxes.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 09_withholding_taxes.png")


def chart_10_deduction_categories(data):
    """Chart 10: Key Deduction Categories Heatmap."""
    fig, ax = plt.subplots(figsize=(18, 10))

    categories = [
        'Meals (Business)',
        'Entertainment',
        'Charitable (Max %)',
        'Home Office',
        'NOL Annual Limit',
        'Vehicle Depreciation',
        'R&D Super Deduction',
        'Interest (EBITDA limit)',
        'Bad Debt',
        'Insurance Premiums',
        'Employee Training',
        'Start-up Costs'
    ]

    # Deductibility percentage or availability score (0-100)
    deduction_matrix = np.array([
        # US, ID, CA, BR, MX, AU, SG
        [50,  100, 50,  100, 91.5, 100, 100],   # Meals (SG: 100% if business)
        [0,   50,  0,   100, 0,    0,   100],    # Entertainment (SG: 100% if business)
        [10,  100, 75,  2,   7,    100, 100],    # Charitable (SG: 250% via IPC, effectively no cap)
        [100, 100, 100, 100, 0,    100, 0],      # Home Office (SG: not available for companies)
        [80,  100, 100, 30,  100,  100, 100],    # NOL Annual Limit (SG: 100%)
        [100, 100, 100, 100, 100,  100, 50],     # Vehicle (SG: Q-plate only, S-plate non-deductible)
        [0,   100, 0,   100, 0,    0,   100],    # R&D Super Deduction (SG: 250-400% EIS)
        [30,  0,   30,  0,   30,   30,  0],      # Interest EBITDA limit (SG: no ratio, arm's length)
        [100, 100, 100, 100, 100,  100, 100],    # Bad Debt
        [100, 100, 100, 100, 100,  100, 100],    # Insurance
        [100, 100, 100, 100, 100,  100, 100],    # Training
        [100, 100, 100, 100, 100,  100, 100],    # Start-up
    ])

    im = ax.imshow(deduction_matrix, cmap='RdYlGn', aspect='auto', vmin=0, vmax=100)

    ax.set_xticks(np.arange(len(COUNTRY_LABELS)))
    ax.set_yticks(np.arange(len(categories)))
    ax.set_xticklabels(COUNTRY_LABELS, fontsize=10, fontweight='bold')
    ax.set_yticklabels(categories, fontsize=11)

    # Add text annotations
    for i in range(len(categories)):
        for j in range(len(COUNTRY_LABELS)):
            val = deduction_matrix[i, j]
            color = 'white' if val < 40 or val > 80 else 'black'
            text = f'{int(val)}%'
            ax.text(j, i, text, ha='center', va='center', fontsize=8, color=color, fontweight='bold')

    ax.set_title('Deduction Categories - Deductibility Matrix (2024/2025)\n(% Deductible or Availability Score)',
                 fontsize=14, fontweight='bold')

    cbar = plt.colorbar(im, ax=ax, fraction=0.03, pad=0.04)
    cbar.set_label('Deductibility %', fontsize=11)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '10_deduction_categories_heatmap.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 10_deduction_categories_heatmap.png")


def chart_11_brazil_simples(data):
    """Chart 11: Brazil Simples Nacional - All Annexes Rate Progression."""
    fig, ax = plt.subplots(figsize=(14, 8))

    br = data['BR']['corporate_tax']['simples_nacional']

    annexes = {
        'Annex I - Commerce': br['annex_1_commerce'],
        'Annex II - Industry': br['annex_2_industry'],
        'Annex III - Services I': br['annex_3_services_i'],
        'Annex V - Tech Services': br['annex_5_services_tech'],
    }

    annex_colors = ['#2ca02c', '#ff7f0e', '#1f77b4', '#d62728']

    for (name, brackets), color in zip(annexes.items(), annex_colors):
        revenues = []
        effective_rates = []
        for b in brackets:
            mid = (b['min'] + b['max']) / 2
            # Effective rate = ((Revenue * Nominal Rate) - Deduction) / Revenue
            effective = ((mid * b['nominal_rate'] / 100) - b['deduction']) / mid * 100
            revenues.append(mid / 1e6)  # In millions R$
            effective_rates.append(effective)

        ax.plot(revenues, effective_rates, 'o-', label=name, color=color, linewidth=2.5, markersize=8)

    ax.set_xlabel('Annual Revenue (R$ millions)', fontsize=12)
    ax.set_ylabel('Effective Tax Rate (%)', fontsize=12)
    ax.set_title('Brazil - Simples Nacional Effective Rates by Annex\nProgressive Rate Structure (2024/2025)', fontsize=14, fontweight='bold')
    ax.legend(fontsize=10, loc='upper left')
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())
    ax.set_xlim(0, 4.5)
    ax.set_ylim(0, 30)
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '11_brazil_simples_nacional.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 11_brazil_simples_nacional.png")


def chart_12_sme_regimes(data):
    """Chart 12: SME Tax Regime Comparison."""
    fig, ax = plt.subplots(figsize=(16, 8))

    # SME effective rates at various revenue levels
    revenue_levels = ['$50K', '$200K', '$500K', '$1M', '$3M', '$5M']
    revenue_values = [50000, 200000, 500000, 1000000, 3000000, 5000000]

    # Approximate effective corporate tax rates for SMEs at each level (% of revenue or profit)
    # These are approximate effective tax-on-profit rates under SME regimes
    sme_rates = {
        'US':        [21, 21, 21, 21, 21, 21],        # Flat 21% federal on profit
        'Indonesia': [0.5, 0.5, 0.5, 0.5, 11, 22],    # 0.5% final tax < IDR 4.8B, then Art 31E, then 22%
        'Canada':    [9, 9, 9, 9, 9, 15],              # 9% SBD up to $500K profit, 15% above
        'Brazil':    [4, 7.3, 9.5, 10.7, 14.3, 34],   # Simples Nacional rates (commerce), then Lucro Real
        'Mexico':    [1, 1.1, 1.5, 2.0, 30, 30],      # RESICO individuals, then standard 30%
        'Australia': [25, 25, 25, 25, 25, 25],          # 25% base rate entity
        'Singapore': [4.25, 8.5, 17, 17, 17, 17],      # SUTE: 4.25% first $100K, 8.5% next $100K, 17% above
    }

    x = np.arange(len(revenue_levels))
    n_countries = len(COUNTRY_ORDER)
    width = 0.11
    offsets = np.arange(n_countries) * width - ((n_countries - 1) * width / 2)

    for i, (code, label) in enumerate(zip(COUNTRY_ORDER, COUNTRY_LABELS)):
        bars = ax.bar(x + offsets[i], sme_rates[code], width, label=label,
                      color=COLORS[code], alpha=0.85, edgecolor='white')

    ax.set_xlabel('Annual Revenue / Income Level (USD Equivalent)', fontsize=12)
    ax.set_ylabel('Effective Tax Rate (%)', fontsize=12)
    ax.set_title('SME Tax Regime Effective Rates at Various Revenue Levels\n(Approximate, 2024/2025)', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(revenue_levels, fontsize=11)
    ax.legend(fontsize=8, loc='upper left', ncol=2)
    ax.set_ylim(0, 40)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '12_sme_regimes.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 12_sme_regimes.png")


def chart_13_total_tax_burden_radar(data):
    """Chart 13: Overall Tax Burden Radar Chart."""
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(polar=True))

    categories = [
        'Corporate\nRate',
        'VAT/GST',
        'Payroll\nBurden',
        'WHT on\nDividends',
        'Interest\nRestriction',
        'NOL\nFlexibility'
    ]

    # Normalize all to 0-10 scale (higher = more burden/restrictive, except NOL flexibility where higher = more flexible)
    scores = {
        'US':        [5.3, 0,   2.0, 7.5, 7.0, 7.0],  # 21%, no federal VAT, low payroll, 30% WHT, 30% EBITDA, 80% limit
        'Indonesia': [5.5, 5.5, 3.0, 5.0, 8.0, 4.0],   # 22%, 11% VAT, ~11%, 20% WHT, DER 4:1, 5yr CF
        'Canada':    [6.5, 6.5, 2.5, 6.3, 7.0, 8.5],   # 26.5% combined, 13% HST, ~8%, 25% WHT, EIFEL 30%, 20yr CF
        'Brazil':    [8.5, 9.3, 9.0, 0.0, 5.0, 5.0],   # 34%, 9.25% PIS/COFINS, ~36%, 0% div, DER 2:1, 30% limit
        'Mexico':    [7.5, 8.0, 7.5, 2.5, 7.0, 6.0],   # 30%, 16% IVA, ~30%, 10% WHT, 30% EBITDA, 10yr CF
        'Australia': [7.5, 5.0, 3.0, 7.5, 7.0, 9.0],   # 30%, 10% GST, ~11.5%, 30% WHT unfranked, 30% EBITDA, indef+carryback
        'Singapore': [4.3, 4.5, 4.3, 0.0, 2.0, 9.5],   # 17%, 9% GST, ~17.25% CPF, 0% div WHT, no ratio limit, indef+CB
    }

    N = len(categories)
    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1]

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=10)

    for code, label in zip(COUNTRY_ORDER, COUNTRY_LABELS):
        values = scores[code]
        values += values[:1]
        ax.plot(angles, values, 'o-', linewidth=2, label=label, color=COLORS[code])
        ax.fill(angles, values, alpha=0.08, color=COLORS[code])

    ax.set_ylim(0, 10)
    ax.set_title('Overall Business Tax Burden Radar\n(Higher = More Burden/Restrictive, 0-10 Scale)',
                 fontsize=13, fontweight='bold', y=1.08)
    ax.legend(loc='upper right', bbox_to_anchor=(1.4, 1.1), fontsize=8)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '13_tax_burden_radar.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 13_tax_burden_radar.png")


def chart_14_canada_provincial(data):
    """Chart 14: Canada Provincial Combined Rates."""
    fig, ax = plt.subplots(figsize=(14, 8))

    ca = data['CA']['corporate_tax']['combined_rates']
    provinces = list(ca['general'].keys())
    general_rates = [ca['general'][p] for p in provinces]
    sb_rates = [ca['small_business'][p] for p in provinces]

    # Clean province names
    clean_names = [p.replace('_', ' ').replace('Labrador', 'Lab.').replace('Newfoundland', 'NL')
                   .replace('Northwest Territories', 'NWT').replace('Prince Edward Island', 'PEI')
                   .replace('British Columbia', 'BC').replace('New Brunswick', 'NB')
                   .replace('Nova Scotia', 'NS').replace('Saskatchewan', 'SK') for p in provinces]

    x = np.arange(len(provinces))
    width = 0.35

    bars1 = ax.bar(x - width/2, general_rates, width, label='General Rate', color='#d62728', alpha=0.85, edgecolor='white')
    bars2 = ax.bar(x + width/2, sb_rates, width, label='Small Business Rate', color='#d62728', alpha=0.4, edgecolor='white', hatch='///')

    for bar in bars1:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.2,
                f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=7, fontweight='bold')
    for bar in bars2:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.2,
                f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=7)

    ax.set_ylabel('Combined Tax Rate (%)', fontsize=12)
    ax.set_title('Canada - Combined Federal + Provincial Corporate Tax Rates (2024)\nGeneral vs. Small Business', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(clean_names, fontsize=8, rotation=45, ha='right')
    ax.legend(fontsize=10)
    ax.set_ylim(0, 38)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '14_canada_provincial_rates.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 14_canada_provincial_rates.png")


def chart_15_indonesia_tax_holiday(data):
    """Chart 15: Indonesia Tax Holiday Tiers."""
    fig, ax = plt.subplots(figsize=(12, 7))

    tiers = data['ID']['corporate_tax']['tax_holiday']['tiers']

    labels = []
    years = []
    for t in tiers:
        min_inv = t['min_investment'] / 1e12
        max_inv = t['max_investment'] / 1e12 if t['max_investment'] else None
        if max_inv:
            labels.append(f'IDR {min_inv:.0f}T - {max_inv:.0f}T')
        else:
            labels.append(f'> IDR {min_inv:.0f}T')
        years.append(t['years'])

    x = np.arange(len(labels))
    bars = ax.bar(x, years, 0.5, color='#ff7f0e', alpha=0.85, edgecolor='white')

    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.3,
                f'{int(bar.get_height())} years\n100% CIT exempt', ha='center', va='bottom',
                fontsize=9, fontweight='bold')

    # Add transition period annotation
    ax.annotate('+ 2 years at 50% CIT reduction (transition)',
                xy=(2, 10), xytext=(3.5, 18),
                arrowprops=dict(arrowstyle='->', color='gray'),
                fontsize=10, style='italic', color='gray')

    ax.set_ylabel('Tax Holiday Duration (Years)', fontsize=12)
    ax.set_title('Indonesia - Tax Holiday Program by Investment Tier\n(PMK 130/2020, Pioneer Industries)', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=10)
    ax.set_ylim(0, 25)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '15_indonesia_tax_holiday.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 15_indonesia_tax_holiday.png")


def chart_16_mexico_resico(data):
    """Chart 16: Mexico RESICO Individual Tax Brackets."""
    fig, ax = plt.subplots(figsize=(12, 7))

    brackets = data['MX']['corporate_tax']['resico_individuals']['brackets']

    income_midpoints = []
    rates = []
    labels = []
    for b in brackets:
        mid = (b['min'] + b['max']) / 2
        income_midpoints.append(mid / 1e6)
        rates.append(b['rate'])
        labels.append(f"MXN {b['min']/1e3:.0f}K-{b['max']/1e3:.0f}K")

    x = np.arange(len(labels))
    bars = ax.bar(x, rates, 0.5, color='#9467bd', alpha=0.85, edgecolor='white')

    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.03,
                f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=11, fontweight='bold')

    # Compare with standard 30% rate
    ax.axhline(y=30, color='red', linestyle='--', alpha=0.7, label='Standard Corporate Rate (30%)')

    ax.set_ylabel('Tax Rate (%)', fontsize=12)
    ax.set_title('Mexico - RESICO Simplified Trust Regime\nIndividual Business Tax Rates vs Standard Corporate Rate',
                 fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=9, rotation=15)
    ax.legend(fontsize=10)
    ax.set_ylim(0, 35)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '16_mexico_resico.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 16_mexico_resico.png")


def chart_17_australia_super_rates(data):
    """Chart 17: Australia Superannuation Guarantee Historical Rates."""
    fig, ax = plt.subplots(figsize=(12, 6))

    rates_hist = data['AU']['superannuation']['historical_rates']
    years = [r['year'] for r in rates_hist]
    rates = [r['rate'] for r in rates_hist]

    x = np.arange(len(years))
    bars = ax.bar(x, rates, 0.5, color='#8c564b', alpha=0.85, edgecolor='white')

    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.1,
                f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=10, fontweight='bold')

    ax.set_ylabel('SG Rate (%)', fontsize=12)
    ax.set_title('Australia - Superannuation Guarantee Rate Progression', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(years, fontsize=10)
    ax.set_ylim(0, 14)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '17_australia_super_rates.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 17_australia_super_rates.png")


def chart_18_comprehensive_summary(data):
    """Chart 18: Comprehensive Tax Summary Table as Chart."""
    fig, ax = plt.subplots(figsize=(22, 10))
    ax.axis('off')

    col_labels = ['Metric'] + COUNTRY_LABELS
    row_data = [
        ['Corporate Rate (Standard)', '21%', '22%', '15% (fed)', '34%', '30%', '30%', '17%'],
        ['Corporate Rate (SME)', '21% (flat)', '0.5-11%', '9% (fed)', '4-19%*', '1-2.5%*', '25%', '4.25-8.5%**'],
        ['VAT/GST Rate', 'N/A (sales tax)', '11%', '5-15%', '9.25%+', '16%', '10%', '9%'],
        ['Payroll Burden (Employer)', '~7.65%', '~11%', '~8.3%', '~35.8%', '~30%', '~11.5%', '~17.25%'],
        ['WHT Dividends (Default)', '30%', '20%', '25%', '0%', '10%', '30%***', '0%'],
        ['WHT Interest (Default)', '30%', '20%', '25%', '15%', '4.9-35%', '10%', '15%'],
        ['NOL Carry-Forward', 'Indefinite', '5 years', '20 years', 'Indefinite', '10 years', 'Indefinite', 'Indefinite'],
        ['NOL Annual Limit', '80%', '100%', '100%', '30%', '100%', '100%', '100%'],
        ['Interest Limit', '30% ATI', 'DER 4:1', '30% EIFEL', 'DER 2:1', '30%', '30%', "Arm's length"],
        ['R&D Incentive Type', 'Credit 20%', 'Super Ded.', 'ITC 15-35%', 'Super Ded.', 'Credit 30%', 'Offset 38-48%', 'EIS 400%'],
        ['Depreciation System', 'MACRS', '4 Groups', 'CCA Classes', 'RFB Rates', 'SL Only', 'Div 40', 'CA S.19/19A'],
        ['Section 179 / Write-off', '$1.22M', 'N/A', '$1.5M CCPC', 'Shifts 2x', 'Limited', '$20K SBE', '1yr accel.'],
    ]

    table = ax.table(cellText=row_data, colLabels=col_labels, loc='center', cellLoc='center')
    table.auto_set_font_size(False)
    table.set_fontsize(8)
    table.scale(1, 1.8)

    # Style header
    for j in range(len(col_labels)):
        cell = table[0, j]
        cell.set_facecolor('#2c3e50')
        cell.set_text_props(color='white', fontweight='bold')

    # Style first column
    for i in range(1, len(row_data) + 1):
        cell = table[i, 0]
        cell.set_facecolor('#ecf0f1')
        cell.set_text_props(fontweight='bold')

    # Alternate row colors
    for i in range(1, len(row_data) + 1):
        for j in range(1, len(col_labels)):
            cell = table[i, j]
            if i % 2 == 0:
                cell.set_facecolor('#f8f9fa')
            else:
                cell.set_facecolor('#ffffff')

    ax.set_title('Comprehensive Business Tax Summary - 7 Countries (2024/2025)\n* Simples/RESICO rates  ** SG Startup Exemption  *** AU unfranked dividends',
                 fontsize=13, fontweight='bold', pad=20)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '18_comprehensive_summary_table.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 18_comprehensive_summary_table.png")


def chart_19_singapore_tax_exemptions(data):
    """Chart 19: Singapore Startup Tax Exemption vs Partial Tax Exemption & Concessionary Rates."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))

    # --- Left chart: Effective tax rates at various income levels ---
    income_levels = ['S$10K', 'S$50K', 'S$100K', 'S$200K', 'S$500K', 'S$1M']
    income_values = [10000, 50000, 100000, 200000, 500000, 1000000]

    # Calculate effective rates under each scheme
    def calc_pte_effective(income):
        """Partial Tax Exemption effective rate."""
        tax = 0
        if income <= 10000:
            tax = income * 0.25 * 0.17
        elif income <= 200000:
            tax = 10000 * 0.25 * 0.17 + (income - 10000) * 0.50 * 0.17
        else:
            tax = 10000 * 0.25 * 0.17 + 190000 * 0.50 * 0.17 + (income - 200000) * 0.17
        return (tax / income) * 100

    def calc_sute_effective(income):
        """Startup Tax Exemption Scheme effective rate."""
        tax = 0
        if income <= 100000:
            tax = income * 0.25 * 0.17
        elif income <= 200000:
            tax = 100000 * 0.25 * 0.17 + (income - 100000) * 0.50 * 0.17
        else:
            tax = 100000 * 0.25 * 0.17 + 100000 * 0.50 * 0.17 + (income - 200000) * 0.17
        return (tax / income) * 100

    pte_rates = [calc_pte_effective(v) for v in income_values]
    sute_rates = [calc_sute_effective(v) for v in income_values]
    headline_rates = [17.0] * len(income_values)

    x = np.arange(len(income_levels))
    width = 0.25

    ax1.bar(x - width, headline_rates, width, label='Headline Rate (17%)', color='#cccccc', alpha=0.7, edgecolor='white')
    ax1.bar(x, pte_rates, width, label='Partial Tax Exemption (PTE)', color='#e377c2', alpha=0.85, edgecolor='white')
    ax1.bar(x + width, sute_rates, width, label='Startup Exemption (SUTE)', color='#e377c2', alpha=0.5, edgecolor='white', hatch='///')

    for i, (pte, sute) in enumerate(zip(pte_rates, sute_rates)):
        ax1.text(x[i], pte + 0.3, f'{pte:.1f}%', ha='center', va='bottom', fontsize=8, fontweight='bold')
        ax1.text(x[i] + width, sute + 0.3, f'{sute:.1f}%', ha='center', va='bottom', fontsize=8)

    ax1.set_ylabel('Effective Tax Rate (%)', fontsize=12)
    ax1.set_title('Effective CIT Rate by Income Level\n(PTE vs. SUTE vs. Headline)', fontsize=13, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(income_levels, fontsize=10)
    ax1.legend(fontsize=9, loc='lower right')
    ax1.set_ylim(0, 20)
    ax1.yaxis.set_major_formatter(mticker.PercentFormatter())

    # --- Right chart: Concessionary rates comparison ---
    incentives = ['Pioneer\nStatus', 'Dev &\nExpansion\n(DEI)', 'Global\nTrader\n(GTP)', 'Financial\nSector\n(FSI)', 'IP Dev\n(IDI)', 'HQ\nProgramme']
    min_rates = [0, 5, 5, 5, 5, 15]
    max_rates = [5, 10, 10, 13.5, 10, 15]

    x2 = np.arange(len(incentives))
    bars_min = ax2.bar(x2 - 0.2, min_rates, 0.35, label='Minimum Rate', color='#e377c2', alpha=0.85, edgecolor='white')
    bars_max = ax2.bar(x2 + 0.2, max_rates, 0.35, label='Maximum Rate', color='#e377c2', alpha=0.45, edgecolor='white', hatch='///')

    for bar in bars_min:
        h = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., h + 0.2,
                f'{h:.0f}%', ha='center', va='bottom', fontsize=10, fontweight='bold')
    for bar in bars_max:
        h = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., h + 0.2,
                f'{h:.1f}%', ha='center', va='bottom', fontsize=10)

    # Standard 17% line
    ax2.axhline(y=17, color='red', linestyle='--', alpha=0.7, label='Standard Rate (17%)')

    ax2.set_ylabel('Concessionary Tax Rate (%)', fontsize=12)
    ax2.set_title('Singapore - Tax Incentive Concessionary Rates\n(EDB-Administered Programmes)', fontsize=13, fontweight='bold')
    ax2.set_xticks(x2)
    ax2.set_xticklabels(incentives, fontsize=9)
    ax2.legend(fontsize=9)
    ax2.set_ylim(0, 22)
    ax2.yaxis.set_major_formatter(mticker.PercentFormatter())

    fig.suptitle('Singapore - Tax Exemptions & Incentive Programmes (YA 2025)',
                 fontsize=15, fontweight='bold')
    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '19_singapore_tax_incentives.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 19_singapore_tax_incentives.png")


def chart_20_foreign_investment_screening(data):
    """Chart 20: Foreign Investment Screening & Restrictions Comparison."""
    fig, ax = plt.subplots(figsize=(18, 10))
    ax.axis('off')

    col_labels = ['Metric'] + COUNTRY_LABELS
    row_data = [
        ['Screening Body',
         'CFIUS', 'BKPM/OSS', 'Investment\nCanada Act', 'Central Bank\n(RDE-IED)', 'CNIE', 'FIRB', 'ACRA/MAS'],
        ['General Threshold',
         'Case-by-case', 'All foreign\ninvestment', 'CAD 1.33B\n(WTO)', 'Registration\nrequired', 'Varies by\nsector', 'AUD 310M\n(agreement)', 'Minimal\nrestrictions'],
        ['Mandatory Filing\nSectors',
         'Critical tech,\ninfra, data', 'Per Positive\nInvestment List', 'National\nsecurity', 'Media (30%),\nland', 'Energy, media,\ntelecom', 'Sensitive land,\nmedia, defence', 'Banking,\ninsurance'],
        ['Land Restrictions',
         'None (general)', 'No ownership\n(HGB lease)', 'None (general)', 'Rural land\nrestrictions', '50km border\n100km coast', 'FIRB approval\nrequired', 'Residential\nproperty (ABSD)'],
        ['Approval Timeline',
         '45+45 days', '3 hrs (OSS)', '~75 days', '~30 days', '~45 days', '30-90 days', '1-3 days'],
        ['FX Controls',
         'None', 'Moderate\n(BI reporting)', 'None', 'Moderate\n(BCB registration)', 'None', 'None', 'None'],
        ['Restrictiveness',
         'Medium', 'Medium-High', 'Low', 'Medium-High', 'Medium', 'Medium', 'Very Low'],
    ]

    table = ax.table(cellText=row_data, colLabels=col_labels, loc='center', cellLoc='center')
    table.auto_set_font_size(False)
    table.set_fontsize(8)
    table.scale(1, 2.2)

    # Style header
    for j in range(len(col_labels)):
        cell = table[0, j]
        cell.set_facecolor('#2c3e50')
        cell.set_text_props(color='white', fontweight='bold')

    # Style first column
    for i in range(1, len(row_data) + 1):
        cell = table[i, 0]
        cell.set_facecolor('#ecf0f1')
        cell.set_text_props(fontweight='bold')

    # Color-code restrictiveness row (last row)
    restrict_colors = {
        'Very Low': '#27ae60', 'Low': '#2ecc71', 'Medium': '#f39c12',
        'Medium-High': '#e67e22', 'High': '#e74c3c'
    }
    for j in range(1, len(col_labels)):
        for i in range(1, len(row_data) + 1):
            cell = table[i, j]
            if i % 2 == 0:
                cell.set_facecolor('#f8f9fa')
            else:
                cell.set_facecolor('#ffffff')
        # Color the restrictiveness row
        val = row_data[-1][j]
        cell = table[len(row_data), j]
        cell.set_facecolor(restrict_colors.get(val, '#ffffff'))
        cell.set_text_props(fontweight='bold', color='white' if val in ['Medium-High', 'High'] else 'black')

    ax.set_title('Foreign Investment Screening & Restrictions Comparison (2024/2025)\nInternational Investor Perspective',
                 fontsize=14, fontweight='bold', pad=20)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '20_foreign_investment_screening.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 20_foreign_investment_screening.png")


def chart_21_nonresident_tax_rates(data):
    """Chart 21: Non-Resident Investor Tax Rates - CGT, Dividend WHT, Branch Tax."""
    fig, axes = plt.subplots(1, 3, figsize=(20, 7))

    countries = COUNTRY_ORDER

    # Capital Gains Tax on Share Disposal (non-resident)
    cgt_rates = [
        15.0,   # US: FIRPTA 15% withholding on USRPI; 0% on non-USRPI shares
        5.0,    # Indonesia: 5% final on unlisted shares
        25.0,   # Canada: 25% withholding on TCP
        15.0,   # Brazil: 15% on non-listed shares (25% tax haven)
        10.0,   # Mexico: 10% on share gains (LISR Art. 161)
        12.5,   # Australia: 12.5% withholding on TAP >AUD 750K
        0.0,    # Singapore: No CGT
    ]

    # Dividend WHT (default vs treaty)
    div_default = [30, 20, 25, 0, 10, 30, 0]
    div_treaty = [15, 10, 5, 0, 10, 15, 0]

    # Branch Profits Tax / Remittance Tax
    branch_tax = [
        30.0,   # US: 30% branch profits tax (IRC §884)
        20.0,   # Indonesia: 20% branch profits tax
        25.0,   # Canada: 25% branch tax (5% treaty)
        0.0,    # Brazil: no branch profits tax
        10.0,   # Mexico: 10% remittance tax (LISR Art. 165)
        0.0,    # Australia: no branch profits tax
        0.0,    # Singapore: no branch profits tax
    ]

    x = np.arange(len(countries))

    # Chart A - CGT on Shares
    ax = axes[0]
    bars = ax.bar(x, cgt_rates, 0.55, color=[COLORS[c] for c in countries], alpha=0.85, edgecolor='white')
    for bar in bars:
        h = bar.get_height()
        label = f'{h:.1f}%' if h > 0 else 'No CGT'
        ax.text(bar.get_x() + bar.get_width()/2., max(h, 0) + 0.4,
                label, ha='center', va='bottom', fontsize=8, fontweight='bold')
    ax.set_title('Capital Gains Tax\n(Non-Resident Share Disposal)', fontsize=12, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(countries, fontsize=8, rotation=15)
    ax.set_ylim(0, 35)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())
    ax.set_ylabel('Rate (%)', fontsize=11)

    # Chart B - Dividend WHT
    ax = axes[1]
    width = 0.35
    bars1 = ax.bar(x - width/2, div_default, width, label='Default (No Treaty)',
                   color=[COLORS[c] for c in countries], alpha=0.85, edgecolor='white')
    bars2 = ax.bar(x + width/2, div_treaty, width, label='Common Treaty Rate',
                   color=[COLORS[c] for c in countries], alpha=0.4, edgecolor='white', hatch='///')
    for bar in bars1:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., max(h, 0) + 0.4,
                f'{h:.0f}%', ha='center', va='bottom', fontsize=7, fontweight='bold')
    for bar in bars2:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., max(h, 0) + 0.4,
                f'{h:.0f}%', ha='center', va='bottom', fontsize=7)
    ax.set_title('Dividend WHT\n(Default vs. Treaty)', fontsize=12, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(countries, fontsize=8, rotation=15)
    ax.set_ylim(0, 40)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())
    ax.legend(fontsize=8)

    # Chart C - Branch Profits Tax
    ax = axes[2]
    bars = ax.bar(x, branch_tax, 0.55, color=[COLORS[c] for c in countries], alpha=0.85, edgecolor='white')
    for bar in bars:
        h = bar.get_height()
        label = f'{h:.0f}%' if h > 0 else 'None'
        ax.text(bar.get_x() + bar.get_width()/2., max(h, 0) + 0.4,
                label, ha='center', va='bottom', fontsize=8, fontweight='bold')
    ax.set_title('Branch Profits Tax /\nRemittance Tax', fontsize=12, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(countries, fontsize=8, rotation=15)
    ax.set_ylim(0, 40)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())

    fig.suptitle('Non-Resident Investor Tax Rates Comparison (2024/2025)',
                 fontsize=15, fontweight='bold')
    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '21_nonresident_tax_rates.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 21_nonresident_tax_rates.png")


def chart_22_repatriation_ease_radar(data):
    """Chart 22: Repatriation & Investment Ease Radar Chart."""
    fig, ax = plt.subplots(figsize=(11, 11), subplot_kw=dict(polar=True))

    categories = [
        'Investment\nOpenness',
        'Dividend\nRepatriation',
        'FX\nFreedom',
        'Treaty\nNetwork',
        'CFC Risk\n(low=better)',
        'Regulatory\nSimplicity'
    ]

    # Scores 0-10 (higher = more investor-friendly)
    scores = {
        'US':        [7, 5, 10, 8, 3, 7],   # Open but CFIUS; 30% div WHT; no FX; 60 treaties; GILTI aggressive; moderate compliance
        'Indonesia': [5, 5, 5, 7, 6, 4],     # Positive list; 20% WHT (0% reinvested); moderate FX; 70 treaties; deemed dividend; complex OSS
        'Canada':    [8, 5, 10, 9, 5, 7],    # High threshold ICA; 25% WHT (5% treaty); no FX; 90 treaties; FAPI active exemption; moderate
        'Brazil':    [5, 9, 5, 3, 2, 3],     # Sector restrictions; 0% div WHT; moderate FX; 35 treaties; universal CFC aggressive; complex
        'Mexico':    [6, 7, 9, 7, 6, 5],     # LIE restrictions; 10% WHT; no FX; 60 treaties; REFIPRE moderate; CFDI requirements
        'Australia': [7, 7, 10, 5, 5, 7],    # FIRB moderate; 0% franked; no FX; 45 treaties; Part X CFC; moderate compliance
        'Singapore': [9, 10, 10, 9, 10, 9],  # Minimal restrictions; 0% WHT; no FX; 90+ treaties; no CFC; simple
    }

    N = len(categories)
    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1]

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=10)

    for code, label in zip(COUNTRY_ORDER, COUNTRY_LABELS):
        values = scores[code]
        values += values[:1]
        ax.plot(angles, values, 'o-', linewidth=2, label=label, color=COLORS[code])
        ax.fill(angles, values, alpha=0.06, color=COLORS[code])

    ax.set_ylim(0, 10)
    ax.set_title('International Investor Friendliness Radar\n(Higher = More Favorable, 0-10 Scale)',
                 fontsize=13, fontweight='bold', y=1.08)
    ax.legend(loc='upper right', bbox_to_anchor=(1.45, 1.1), fontsize=9)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '22_repatriation_ease_radar.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 22_repatriation_ease_radar.png")


def chart_23_investor_decision_matrix(data):
    """Chart 23: International Investor Decision Matrix Heatmap."""
    fig, ax = plt.subplots(figsize=(18, 10))

    categories = [
        'Investment Openness',
        'Dividend Tax Efficiency',
        'Capital Gains Tax',
        'Branch Tax Cost',
        'FX Controls / Repatriation',
        'CFC Regime Severity',
        'Treaty Network Breadth',
        'PE Risk Threshold',
        'Regulatory Complexity',
        'Overall Investor Score',
    ]

    # Scores 1-10 (10 = most favorable for international investor)
    # Higher is always better from investor perspective
    matrix = np.array([
        # US   ID   CA   BR   MX   AU   SG
        [7,   5,   8,   5,   6,   7,   9],    # Investment Openness
        [4,   5,   4,   10,  7,   7,   10],   # Dividend Tax Efficiency (0% WHT = 10)
        [7,   7,   5,   6,   7,   7,   10],   # Capital Gains Tax (no CGT = 10)
        [4,   5,   5,   10,  7,   10,  10],   # Branch Tax Cost (no branch tax = 10)
        [10,  5,   10,  5,   9,   10,  10],   # FX Controls (none = 10)
        [3,   6,   5,   2,   6,   5,   10],   # CFC Regime Severity (no CFC = 10)
        [8,   7,   9,   3,   7,   5,   9],    # Treaty Network (90+ = 9-10)
        [7,   5,   7,   6,   5,   7,   7],    # PE Risk Threshold (higher months = better)
        [6,   4,   7,   3,   5,   7,   9],    # Regulatory Complexity (simpler = higher)
        [6.2, 5.4, 6.7, 5.6, 6.6, 7.2, 9.3], # Overall (weighted average)
    ])

    im = ax.imshow(matrix, cmap='RdYlGn', aspect='auto', vmin=1, vmax=10)

    ax.set_xticks(np.arange(len(COUNTRY_LABELS)))
    ax.set_yticks(np.arange(len(categories)))
    ax.set_xticklabels(COUNTRY_LABELS, fontsize=10, fontweight='bold')
    ax.set_yticklabels(categories, fontsize=11)

    # Add text annotations
    for i in range(len(categories)):
        for j in range(len(COUNTRY_LABELS)):
            val = matrix[i, j]
            color = 'white' if val < 4 or val > 7 else 'black'
            fmt = f'{val:.1f}' if i == len(categories) - 1 else f'{int(val)}'
            ax.text(j, i, fmt, ha='center', va='center', fontsize=9,
                    color=color, fontweight='bold')

    # Highlight overall row
    for j in range(len(COUNTRY_LABELS)):
        cell_rect = plt.Rectangle((j - 0.5, len(categories) - 1 - 0.5), 1, 1,
                                   fill=False, edgecolor='gold', linewidth=3)
        ax.add_patch(cell_rect)

    ax.set_title('International Investor Decision Matrix (2024/2025)\n'
                 'Score 1-10 (10 = Most Favorable for Foreign Investor)',
                 fontsize=14, fontweight='bold')

    cbar = plt.colorbar(im, ax=ax, fraction=0.03, pad=0.04)
    cbar.set_label('Investor Favorability Score', fontsize=11)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '23_investor_decision_matrix.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 23_investor_decision_matrix.png")


def chart_24_capital_gains_comparison(data):
    """Chart 24: Capital Gains Tax Rates Comparison - Shares, Real Property, Business Assets."""
    fig, axes = plt.subplots(1, 3, figsize=(20, 7))

    categories = ['Shares\n(Listed)', 'Shares\n(Non-Listed)', 'Real Property']

    # Extract CGT rates per country (keys match COUNTRY_ORDER)
    rates = {
        'US': [21.0, 21.0, 21.0],            # Corporate: no preferential rate
        'Indonesia': [0.1, 22.0, 2.5],       # 0.1% final listed, 22% non-listed, 2.5% final land/building
        'Canada': [7.5, 7.5, 7.5],           # 50% inclusion × 15% = ~7.5% federal
        'Brazil': [15.0, 15.0, 34.0],        # 15% swing trade, 15% non-listed, 34% corporate
        'Mexico': [10.0, 30.0, 30.0],        # 10% listed, 30% corporate, 30% corporate
        'Australia': [30.0, 30.0, 30.0],     # No discount for companies
        'Singapore': [0.0, 0.0, 0.0],        # No CGT
    }

    for idx, cat in enumerate(categories):
        ax = axes[idx]
        vals = [rates[c][idx] for c in COUNTRY_ORDER]
        colors = [COLORS[c] for c in COUNTRY_ORDER]
        bars = ax.bar(COUNTRY_LABELS, vals, color=colors, edgecolor='white', linewidth=0.5)

        for bar, val in zip(bars, vals):
            label = f'{val:.1f}%' if val != int(val) else f'{int(val)}%'
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.5,
                    label, ha='center', va='bottom', fontsize=9, fontweight='bold')

        ax.set_title(cat, fontsize=13, fontweight='bold')
        ax.set_ylabel('Tax Rate (%)' if idx == 0 else '')
        ax.set_ylim(0, max(vals) * 1.25 + 1)
        ax.tick_params(axis='x', rotation=45)

    fig.suptitle('Capital Gains Tax Rates by Asset Type — Corporate Taxpayer (2024/2025)',
                 fontsize=15, fontweight='bold', y=1.02)
    fig.text(0.5, -0.02, 'Note: Rates shown for corporate taxpayers. Indonesia uses final tax on listed shares & property transfers.\n'
             'Singapore has no capital gains tax. Canada rate reflects 50% inclusion × federal CIT rate.',
             ha='center', fontsize=9, style='italic')

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '24_capital_gains_comparison.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 24_capital_gains_comparison.png")


def chart_25_dividend_interest_treatment(data):
    """Chart 25: Inter-Corporate Dividend & Interest Income Treatment."""
    fig, axes = plt.subplots(1, 2, figsize=(18, 8))

    # Panel 1: Inter-corporate dividend effective tax rate
    ax1 = axes[0]
    # Effective additional tax on dividends received by a company (keys match COUNTRY_ORDER)
    div_rates = {
        'US': 10.5,          # 50% DRD on portfolio → 21% × 50% = 10.5% (non-affiliated)
        'Indonesia': 0.0,    # Exempt under Pasal 4(3)(f)
        'Canada': 38.33,     # Part IV refundable tax (refundable on dividend payment)
        'Brazil': 0.0,       # Exempt (Lei 9.249/1995)
        'Mexico': 0.0,       # From CUFIN: no additional tax
        'Australia': 0.0,    # Franked dividends: no additional tax
        'Singapore': 0.0,    # One-tier: exempt
    }

    vals = [div_rates[c] for c in COUNTRY_ORDER]
    colors = [COLORS[c] for c in COUNTRY_ORDER]
    bars = ax1.bar(COUNTRY_LABELS, vals, color=colors, edgecolor='white', linewidth=0.5)

    for bar, val, code in zip(bars, vals, COUNTRY_ORDER):
        label = f'{val:.1f}%' if val != int(val) else f'{int(val)}%'
        y_pos = bar.get_height() + 0.3 if val > 0 else 0.3
        ax1.text(bar.get_x() + bar.get_width() / 2, y_pos,
                label, ha='center', va='bottom', fontsize=10, fontweight='bold')

    # Add annotations for special cases (keys match COUNTRY_ORDER)
    annotations = {
        'US': '50% DRD\n(<20% ownership)',
        'Indonesia': 'Exempt\n(UU HPP)',
        'Canada': 'Refundable\n(RDTOH)',
        'Brazil': 'Exempt\n(Lei 9.249)',
        'Mexico': 'From CUFIN:\nNo add\'l tax',
        'Australia': 'Franked:\nNo add\'l tax',
        'Singapore': 'One-tier:\nExempt'
    }
    for i, code in enumerate(COUNTRY_ORDER):
        ax1.text(i, -5.5, annotations[code], ha='center', va='top', fontsize=7,
                style='italic', color='gray')

    ax1.set_title('Inter-Corporate Dividend\nEffective Additional Tax Rate', fontsize=13, fontweight='bold')
    ax1.set_ylabel('Effective Tax Rate (%)')
    ax1.set_ylim(-8, max(vals) * 1.3 + 2)
    ax1.axhline(y=0, color='black', linewidth=0.5)
    ax1.tick_params(axis='x', rotation=45)

    # Panel 2: Interest income treatment
    ax2 = axes[1]
    # Standard CIT rate on interest income received
    int_rates = [21.0, 22.0, 15.0, 34.0, 30.0, 30.0, 17.0]  # Standard CIT rates
    # Special/concessionary rates where applicable
    special_rates = [0.0, 10.0, 0.0, 15.0, 0.0, 0.0, 10.0]  # Muni bonds, bond final, fixed income min, QDS

    x = np.arange(len(COUNTRY_LABELS))
    width = 0.35

    bars1 = ax2.bar(x - width/2, int_rates, width, label='Standard CIT Rate',
                     color=[COLORS[c] for c in COUNTRY_ORDER], edgecolor='white', linewidth=0.5)
    bars2 = ax2.bar(x + width/2, special_rates, width, label='Concessionary / Final Rate',
                     color=[COLORS[c] for c in COUNTRY_ORDER], edgecolor='white', linewidth=0.5, alpha=0.5)

    for bar, val in zip(bars1, int_rates):
        ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3,
                f'{int(val)}%', ha='center', va='bottom', fontsize=9, fontweight='bold')
    for bar, val in zip(bars2, special_rates):
        if val > 0:
            ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3,
                    f'{int(val)}%', ha='center', va='bottom', fontsize=8, color='gray')

    special_labels = ['Muni: 0%', 'Bonds: 10%\nfinal', 'N/A', 'Min: 15%\n(>720d)', 'N/A', 'N/A', 'QDS: 10%']
    for i, lbl in enumerate(special_labels):
        if lbl != 'N/A':
            ax2.text(i, -4.5, lbl, ha='center', va='top', fontsize=7, style='italic', color='gray')

    ax2.set_title('Interest Income — Corporate Tax Rate\nvs. Concessionary Rates', fontsize=13, fontweight='bold')
    ax2.set_ylabel('Tax Rate (%)')
    ax2.set_xticks(x)
    ax2.set_xticklabels(COUNTRY_LABELS, rotation=45)
    ax2.set_ylim(-7, max(int_rates) * 1.2 + 2)
    ax2.axhline(y=0, color='black', linewidth=0.5)
    ax2.legend(fontsize=9, loc='upper right')

    fig.suptitle('Dividend & Interest Income Treatment — Corporate Recipient (2024/2025)',
                 fontsize=15, fontweight='bold', y=1.02)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '25_dividend_interest_treatment.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 25_dividend_interest_treatment.png")


def chart_26_sector_specific_taxes(data):
    """Chart 26: Sector-Specific Revenue Taxes Matrix (Heatmap)."""
    fig, ax = plt.subplots(figsize=(18, 10))

    tax_types = [
        'Digital Services Tax',
        'Natural Resource\nRoyalties/PRRT',
        'Insurance Premium Tax',
        'Financial Transaction\nTax',
        'Gaming/Betting\nGGR Tax',
        'Agricultural\nSpecial Regime'
    ]

    # Rate intensity matrix (representative rate or indicator, 0 = N/A)
    # Values represent the primary/headline rate for comparison
    matrix = np.array([
        # US    ID    CA    BR    MX    AU    SG
        [0,    11,    3,    0,    0,    0,    0],      # DST: ID=11% VAT, CA=3% DST
        [15,    7,   13,   3.5,  7.5,  40,    0],     # Resources: US=15% depl, ID=7% coal max, CA=13% BC, BR=3.5% iron, MX=7.5% mining, AU=40% PRRT
        [4,     0,    4,   7.38,  0,   11,    0],     # Insurance: US=4% fed, CA=4.4% max prov, BR=7.38% IOF, AU=11% SA
        [0,    0.1,   0,   0.38,  0,  0.06,  0.2],   # FTT: ID=0.1% stock, BR=0.38% IOF credit, AU=0.06% bank levy, SG=0.2% stamp
        [6.75, 25,    0,   12,   30,   15,   22],     # Gaming: US=NV 6.75%, ID=25% lottery, BR=12% GGR, MX=30% IEPS, AU=15% POC, SG=22% mass
        [0,   0.5,    0,   1.2,   0,    0,    0],     # Agri: ID=0.5% MSME, BR=1.2% FUNRURAL
    ])

    # Custom colormap: white for 0, then gradient
    import matplotlib.colors as mcolors
    cmap = plt.cm.YlOrRd.copy()
    cmap.set_under('white')

    # Mask zeros for display
    masked_matrix = np.ma.masked_where(matrix == 0, matrix)

    im = ax.imshow(matrix, cmap=cmap, aspect='auto', vmin=0.01, vmax=40)

    ax.set_xticks(np.arange(len(COUNTRY_LABELS)))
    ax.set_yticks(np.arange(len(tax_types)))
    ax.set_xticklabels(COUNTRY_LABELS, fontsize=11, fontweight='bold')
    ax.set_yticklabels(tax_types, fontsize=11)

    # Annotations with rates
    rate_labels = [
        # DST
        ['No DST', '11% VAT\n(PMSE)', '3% DST', 'No DST', 'No DST\n(1-4% ISR)', 'No DST\n(MAAL/DPT)', 'No DST\n(9% GST OVR)'],
        # Resources
        ['15%\nDepletion', '3-7%\nCoal', '1-40%\nProvincial', '3.5%\nIron Ore', '7.5%\nMining', '40%\nPRRT', 'No\nResources'],
        # Insurance
        ['4%\nFed Excise', 'No IPT', '2-4.4%\nProvincial', '0.38-7.38%\nIOF', 'No IPT', '5-11%\nState Duty', 'No IPT'],
        # FTT
        ['No FTT\n($8/M SEC)', '0.1%\nStock Levy', 'No FTT\n(LTT only)', '0.38%+\nIOF Credit', 'No FTT\n(IDE repl.)', '0.06%\nBank Levy', '0.2%\nStamp Duty'],
        # Gaming
        ['6.75-54%\nState', '25%\nLottery', 'Provincial\nCrown Corp', '12%\nGGR', '30%\nIEPS', '15%\nPOC Tax', '8-22%\nCasino GGR'],
        # Agri
        ['Std CIT\n(farm NOL)', '0.5%\nMSME', 'Cash method\n(ITA s28)', '1.2%\nFUNRURAL', 'AGAPE\nExemption', 'FMD\n$800K', 'Std CIT\n(minimal)'],
    ]

    for i in range(len(tax_types)):
        for j in range(len(COUNTRY_LABELS)):
            val = matrix[i, j]
            text_color = 'white' if val > 15 else ('black' if val > 0 else '#666666')
            ax.text(j, i, rate_labels[i][j], ha='center', va='center', fontsize=7.5,
                    color=text_color, fontweight='bold' if val > 0 else 'normal')

    ax.set_title('Sector-Specific Revenue Taxes Matrix (2024/2025)\n'
                 'Key Rates & Indicators by Country and Tax Type',
                 fontsize=14, fontweight='bold')

    cbar = plt.colorbar(im, ax=ax, fraction=0.03, pad=0.04)
    cbar.set_label('Representative Rate (%)', fontsize=11)

    plt.tight_layout()
    fig.savefig(CHARTS_DIR / '26_sector_specific_taxes.png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    print("  [OK] 26_sector_specific_taxes.png")


def main():
    """Generate all charts."""
    print("Loading data files...")
    data = load_data()
    print(f"Loaded {len(data)} countries.\n")

    print("Generating charts...")
    chart_1_corporate_tax_rates(data)
    chart_2_combined_federal_state(data)
    chart_3_vat_gst_rates(data)
    chart_4_employer_payroll_burden(data)
    chart_5_depreciation_comparison(data)
    chart_6_nol_rules(data)
    chart_7_rnd_incentives(data)
    chart_8_interest_limitation(data)
    chart_9_withholding_taxes(data)
    chart_10_deduction_categories(data)
    chart_11_brazil_simples(data)
    chart_12_sme_regimes(data)
    chart_13_total_tax_burden_radar(data)
    chart_14_canada_provincial(data)
    chart_15_indonesia_tax_holiday(data)
    chart_16_mexico_resico(data)
    chart_17_australia_super_rates(data)
    chart_18_comprehensive_summary(data)
    chart_19_singapore_tax_exemptions(data)
    chart_20_foreign_investment_screening(data)
    chart_21_nonresident_tax_rates(data)
    chart_22_repatriation_ease_radar(data)
    chart_23_investor_decision_matrix(data)
    chart_24_capital_gains_comparison(data)
    chart_25_dividend_interest_treatment(data)
    chart_26_sector_specific_taxes(data)

    print(f"\nAll {26} charts generated successfully in: {CHARTS_DIR}")


if __name__ == '__main__':
    main()
