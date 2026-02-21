#!/usr/bin/env python3
"""
B2B Startup Tax Optimization Engine
====================================
Evaluates all 7-country combinations for optimal B2B startup structuring.
Considers: incorporation, operations, IP holding, investor corridors,
withholding taxes, CFC rules, and total effective tax burden.

Countries: US, SG, ID, CA, BR, MX, AU
"""

import json
import itertools
import os
from dataclasses import dataclass, field
from typing import Optional

# ─────────────────────────────────────────────────────────────────────
# 1. COUNTRY TAX PARAMETERS (extracted from all JSON data files)
# ─────────────────────────────────────────────────────────────────────

@dataclass
class CountryTax:
    code: str
    name: str
    currency: str

    # Corporate tax
    cit_standard: float          # Standard CIT rate %
    cit_sme: float               # SME / startup effective rate %
    cit_sme_threshold: str       # Revenue threshold for SME regime
    cit_sme_regime: str          # Name of SME regime

    # Indirect tax
    vat_gst: float               # Standard VAT/GST/Sales tax %

    # Employer payroll burden
    payroll_employer: float      # Total employer contribution %

    # Withholding taxes (non-resident defaults)
    wht_dividend: float
    wht_interest: float
    wht_royalty: float
    wht_technical: float         # Technical/management fees WHT

    # Branch vs Subsidiary
    branch_tax: float
    branch_remittance: float
    subsidiary_tax: float
    subsidiary_div_wht: float

    # Deductions
    nol_carry_forward: str       # Years or "indefinite"
    nol_limitation: float        # Annual limitation %
    rnd_benefit: float           # Effective R&D benefit multiplier (% of spend)
    rnd_description: str
    interest_limit_type: str     # "EBITDA 30%", "DER 4:1", "none"
    depreciation_it_years: float # Years to write off IT equipment
    startup_expense_deduction: bool

    # International investor factors
    cgt_nonresident: float       # CGT on share sales by non-residents
    fx_controls: str             # "none", "moderate"
    screening_severity: str      # "minimal", "moderate", "heavy"
    treaty_count: int
    has_cfc: bool
    cfc_severity: str            # "none", "light", "moderate", "aggressive"
    territorial_system: bool
    exit_tax: bool

    # Special B2B startup factors
    patent_box_rate: Optional[float] = None
    ip_concessionary: Optional[str] = None
    digital_services_tax: bool = False
    dst_rate: float = 0.0

    # Scores (computed)
    incorporation_score: float = 0.0
    operations_score: float = 0.0
    ip_holding_score: float = 0.0
    investor_friendliness: float = 0.0


COUNTRIES = {
    "US": CountryTax(
        code="US", name="United States", currency="USD",
        cit_standard=21.0, cit_sme=21.0,
        cit_sme_threshold="N/A (flat rate)",
        cit_sme_regime="Flat 21% (QSBS 100% CGT exclusion for startups)",
        vat_gst=0.0,  # No federal; state 0-10.25%
        payroll_employer=7.65,
        wht_dividend=30.0, wht_interest=30.0, wht_royalty=30.0, wht_technical=30.0,
        branch_tax=21.0, branch_remittance=30.0,
        subsidiary_tax=21.0, subsidiary_div_wht=30.0,
        nol_carry_forward="indefinite", nol_limitation=80.0,
        rnd_benefit=20.0, rnd_description="20% regular credit / 14% ASC",
        interest_limit_type="EBITDA 30% (exempt <$29M)",
        depreciation_it_years=5.0, startup_expense_deduction=True,
        cgt_nonresident=0.0,  # 0% on non-USRPI shares
        fx_controls="none", screening_severity="moderate",  # CFIUS
        treaty_count=60, has_cfc=True, cfc_severity="aggressive",  # Subpart F + GILTI
        territorial_system=False, exit_tax=False,
        patent_box_rate=None,
        ip_concessionary="FDII 13.125% effective on foreign-derived intangible income",
        digital_services_tax=False, dst_rate=0.0,
    ),
    "SG": CountryTax(
        code="SG", name="Singapore", currency="SGD",
        cit_standard=17.0, cit_sme=4.25,
        cit_sme_threshold="First SGD 100K (SUTE: first 3 YAs)",
        cit_sme_regime="Startup Tax Exemption (SUTE): 75% exempt first 100K, 50% next 100K",
        vat_gst=9.0,
        payroll_employer=17.25,  # CPF 17% + SDL 0.25%
        wht_dividend=0.0, wht_interest=15.0, wht_royalty=10.0, wht_technical=17.0,
        branch_tax=17.0, branch_remittance=0.0,
        subsidiary_tax=17.0, subsidiary_div_wht=0.0,
        nol_carry_forward="indefinite", nol_limitation=100.0,
        rnd_benefit=400.0, rnd_description="EIS 400% enhanced deduction (cap SGD 400K/activity)",
        interest_limit_type="None (arm's length only)",
        depreciation_it_years=1.0, startup_expense_deduction=True,
        cgt_nonresident=0.0,
        fx_controls="none", screening_severity="minimal",
        treaty_count=90, has_cfc=False, cfc_severity="none",
        territorial_system=True, exit_tax=False,
        patent_box_rate=None,
        ip_concessionary="Pioneer Status 0-5%, DEI 5-10%, IP Dev Incentive 5-10%",
        digital_services_tax=False, dst_rate=0.0,
    ),
    "ID": CountryTax(
        code="ID", name="Indonesia", currency="IDR",
        cit_standard=22.0, cit_sme=0.5,
        cit_sme_threshold="IDR 4.8B gross turnover (~USD 300K)",
        cit_sme_regime="MSME Final Tax 0.5% of gross revenue (4 years for PT)",
        vat_gst=11.0,  # 12% planned 2025
        payroll_employer=11.0,
        wht_dividend=20.0, wht_interest=20.0, wht_royalty=20.0, wht_technical=20.0,
        branch_tax=22.0, branch_remittance=20.0,
        subsidiary_tax=22.0, subsidiary_div_wht=20.0,
        nol_carry_forward="5 years (10 extended)", nol_limitation=100.0,
        rnd_benefit=300.0, rnd_description="300% super deduction (national research body)",
        interest_limit_type="DER 4:1",
        depreciation_it_years=4.0, startup_expense_deduction=False,
        cgt_nonresident=5.0,  # Unlisted shares
        fx_controls="moderate", screening_severity="heavy",  # BKPM, Positive Investment List
        treaty_count=70, has_cfc=True, cfc_severity="moderate",
        territorial_system=False, exit_tax=False,
        patent_box_rate=None,
        ip_concessionary="Tax Holiday: 0% CIT for 5-20 years (IDR 100B+ investment)",
        digital_services_tax=True, dst_rate=11.0,
    ),
    "CA": CountryTax(
        code="CA", name="Canada", currency="CAD",
        cit_standard=26.5, cit_sme=11.0,
        cit_sme_threshold="CAD 500K active business income (CCPC)",
        cit_sme_regime="Small Business Deduction: 9% federal + 2% Alberta = 11%",
        vat_gst=5.0,  # Federal GST; HST up to 15%
        payroll_employer=8.27,  # CPP 5.95% + EI 2.324%
        wht_dividend=25.0, wht_interest=25.0, wht_royalty=25.0, wht_technical=25.0,
        branch_tax=15.0, branch_remittance=25.0,
        subsidiary_tax=15.0, subsidiary_div_wht=25.0,
        nol_carry_forward="20 years", nol_limitation=100.0,
        rnd_benefit=35.0, rnd_description="SR&ED 35% refundable ITC (CCPC, first CAD 3M)",
        interest_limit_type="EIFEL 30% EBITDA",
        depreciation_it_years=2.0,  # Class 50 at 55% DB
        startup_expense_deduction=True,
        cgt_nonresident=25.0,  # TCP WHT (but 50% inclusion rate)
        fx_controls="none", screening_severity="moderate",
        treaty_count=90, has_cfc=True, cfc_severity="moderate",  # FAPI
        territorial_system=False, exit_tax=False,
        patent_box_rate=None,
        ip_concessionary=None,
        digital_services_tax=True, dst_rate=3.0,
    ),
    "BR": CountryTax(
        code="BR", name="Brazil", currency="BRL",
        cit_standard=34.0, cit_sme=4.0,
        cit_sme_threshold="BRL 4.8M (~USD 960K) Simples Nacional",
        cit_sme_regime="Simples Nacional: 4-33% all-in (Annex 1 starts at 4%)",
        vat_gst=9.25,  # PIS/COFINS non-cumulative; ICMS 17-20% separate
        payroll_employer=35.8,
        wht_dividend=0.0, wht_interest=15.0, wht_royalty=15.0, wht_technical=15.0,
        branch_tax=34.0, branch_remittance=0.0,
        subsidiary_tax=34.0, subsidiary_div_wht=0.0,
        nol_carry_forward="indefinite", nol_limitation=30.0,
        rnd_benefit=180.0, rnd_description="Lei do Bem: 160-180% deduction on R&D spend",
        interest_limit_type="DER 2:1 (related party); JCP deductible",
        depreciation_it_years=5.0, startup_expense_deduction=False,
        cgt_nonresident=15.0,
        fx_controls="moderate", screening_severity="moderate",
        treaty_count=35, has_cfc=True, cfc_severity="aggressive",  # Universal CFC
        territorial_system=False, exit_tax=False,
        patent_box_rate=None,
        ip_concessionary="JCP (Interest on Capital): ~19% net tax benefit on equity distributions",
        digital_services_tax=False, dst_rate=0.0,
    ),
    "MX": CountryTax(
        code="MX", name="Mexico", currency="MXN",
        cit_standard=30.0, cit_sme=20.0,
        cit_sme_threshold="Northern/Southeast border zones (90%+ revenue from zone)",
        cit_sme_regime="Border Zone ISR: 20% effective rate (1/3 credit on ISR)",
        vat_gst=16.0,  # 8% border zone
        payroll_employer=30.0,  # IMSS approximate
        wht_dividend=10.0, wht_interest=4.9, wht_royalty=25.0, wht_technical=25.0,
        branch_tax=30.0, branch_remittance=10.0,
        subsidiary_tax=30.0, subsidiary_div_wht=10.0,
        nol_carry_forward="10 years", nol_limitation=100.0,
        rnd_benefit=30.0, rnd_description="30% incremental R&D credit (cap MXN 50M)",
        interest_limit_type="EBITDA 30% + DER 3:1",
        depreciation_it_years=3.33, startup_expense_deduction=False,
        cgt_nonresident=10.0,
        fx_controls="none", screening_severity="moderate",  # CNIE
        treaty_count=60, has_cfc=True, cfc_severity="moderate",  # REFIPRE
        territorial_system=False, exit_tax=False,
        patent_box_rate=None,
        ip_concessionary=None,
        digital_services_tax=False, dst_rate=0.0,
    ),
    "AU": CountryTax(
        code="AU", name="Australia", currency="AUD",
        cit_standard=30.0, cit_sme=25.0,
        cit_sme_threshold="AUD 50M turnover + <80% passive income",
        cit_sme_regime="Base Rate Entity: 25% (turnover <AUD 50M)",
        vat_gst=10.0,
        payroll_employer=16.5,  # Super 11.5% + payroll tax ~5%
        wht_dividend=30.0, wht_interest=10.0, wht_royalty=30.0, wht_technical=30.0,
        branch_tax=30.0, branch_remittance=0.0,
        subsidiary_tax=30.0, subsidiary_div_wht=0.0,  # Franked = 0%
        nol_carry_forward="indefinite", nol_limitation=100.0,
        rnd_benefit=48.5, rnd_description="R&D Tax Incentive: 43.5-48.5% refundable offset (small co)",
        interest_limit_type="EBITDA 30% (safe harbour 60% debt)",
        depreciation_it_years=4.0, startup_expense_deduction=True,
        cgt_nonresident=12.5,  # TAP withholding
        fx_controls="none", screening_severity="moderate",  # FIRB
        treaty_count=45, has_cfc=True, cfc_severity="moderate",
        territorial_system=False, exit_tax=False,
        patent_box_rate=None,
        ip_concessionary="R&D offset refundable for small companies (<AUD 20M turnover)",
        digital_services_tax=False, dst_rate=0.0,
    ),
}

# ─────────────────────────────────────────────────────────────────────
# 2. TREATY WITHHOLDING TAX MATRIX (common treaty rates between pairs)
# ─────────────────────────────────────────────────────────────────────

# Format: (from, to) -> (div_wht%, int_wht%, royalty_wht%)
# These are typical treaty-reduced rates for the 7 countries
TREATY_RATES = {
    # US treaties
    ("US", "SG"): (15.0, 15.0, 15.0),   # No comprehensive treaty; default/limited
    ("US", "ID"): (15.0, 10.0, 10.0),
    ("US", "CA"): (5.0, 0.0, 0.0),       # Very favorable US-CA treaty
    ("US", "BR"): (15.0, 15.0, 15.0),    # No treaty; WHT at domestic rates
    ("US", "MX"): (5.0, 4.9, 10.0),
    ("US", "AU"): (15.0, 10.0, 5.0),

    # SG treaties
    ("SG", "US"): (0.0, 15.0, 15.0),     # SG has 0% div WHT outbound
    ("SG", "ID"): (0.0, 10.0, 10.0),
    ("SG", "CA"): (0.0, 15.0, 10.0),
    ("SG", "BR"): (0.0, 15.0, 15.0),     # No SG-BR treaty; SG outbound still 0% div
    ("SG", "MX"): (0.0, 15.0, 10.0),
    ("SG", "AU"): (0.0, 10.0, 5.0),

    # ID treaties
    ("ID", "US"): (15.0, 10.0, 10.0),
    ("ID", "SG"): (10.0, 10.0, 10.0),
    ("ID", "CA"): (15.0, 10.0, 10.0),
    ("ID", "BR"): (15.0, 15.0, 15.0),
    ("ID", "MX"): (10.0, 10.0, 10.0),
    ("ID", "AU"): (15.0, 10.0, 10.0),

    # CA treaties
    ("CA", "US"): (5.0, 0.0, 0.0),
    ("CA", "SG"): (15.0, 15.0, 10.0),
    ("CA", "ID"): (15.0, 10.0, 10.0),
    ("CA", "BR"): (15.0, 15.0, 15.0),
    ("CA", "MX"): (10.0, 10.0, 10.0),
    ("CA", "AU"): (15.0, 10.0, 10.0),

    # BR treaties (limited network, 35 treaties)
    ("BR", "US"): (0.0, 15.0, 15.0),     # BR 0% div WHT outbound
    ("BR", "SG"): (0.0, 15.0, 15.0),
    ("BR", "ID"): (0.0, 15.0, 15.0),
    ("BR", "CA"): (0.0, 15.0, 15.0),
    ("BR", "MX"): (0.0, 15.0, 15.0),
    ("BR", "AU"): (0.0, 15.0, 15.0),

    # MX treaties
    ("MX", "US"): (5.0, 4.9, 10.0),
    ("MX", "SG"): (0.0, 10.0, 10.0),
    ("MX", "ID"): (10.0, 10.0, 10.0),
    ("MX", "CA"): (10.0, 10.0, 10.0),
    ("MX", "BR"): (10.0, 15.0, 15.0),
    ("MX", "AU"): (10.0, 10.0, 10.0),

    # AU treaties
    ("AU", "US"): (0.0, 10.0, 5.0),       # Franked div = 0%
    ("AU", "SG"): (0.0, 10.0, 5.0),
    ("AU", "ID"): (0.0, 10.0, 10.0),
    ("AU", "CA"): (0.0, 10.0, 10.0),
    ("AU", "BR"): (0.0, 15.0, 15.0),
    ("AU", "MX"): (0.0, 10.0, 10.0),
}


# ─────────────────────────────────────────────────────────────────────
# 3. OPTIMIZATION SCORING ENGINE
# ─────────────────────────────────────────────────────────────────────

@dataclass
class B2BStartupScenario:
    """Revenue and cost assumptions for a typical B2B SaaS/tech startup."""
    annual_revenue: float = 500_000        # USD equivalent
    cogs_pct: float = 20.0                 # % of revenue
    opex_pct: float = 50.0                 # % of revenue (salaries, rent, etc.)
    rnd_spend_pct: float = 15.0            # % of revenue
    ip_royalty_pct: float = 10.0           # % of revenue paid as IP royalty
    profit_margin_pct: float = 15.0        # Pre-tax profit after all costs
    headcount: int = 10
    avg_salary: float = 50_000             # USD equivalent per employee
    investor_dividend_pct: float = 30.0    # % of after-tax profit distributed
    years_to_exit: int = 5
    exit_multiple: float = 8.0             # Revenue multiple at exit


def compute_effective_tax_chain(
    incorp: CountryTax,
    ops: CountryTax,
    ip_hold: CountryTax,
    investor_country: CountryTax,
    scenario: B2BStartupScenario,
) -> dict:
    """
    Compute the total effective tax burden across a multi-entity structure:
    - Operating entity (ops country) earns revenue, pays costs
    - IP holding entity (ip_hold country) receives royalties
    - Holding company (incorp country) receives dividends
    - Investor (investor_country) receives distributions
    """
    rev = scenario.annual_revenue
    profit_before_royalty = rev * (scenario.profit_margin_pct + scenario.ip_royalty_pct) / 100.0
    ip_royalty = rev * scenario.ip_royalty_pct / 100.0
    taxable_profit_ops = profit_before_royalty - ip_royalty  # After royalty deduction

    # ── Step 1: Operating entity CIT ──
    # Use SME rate if applicable (startup)
    if rev <= 500_000:
        ops_cit_rate = ops.cit_sme if ops.cit_sme < ops.cit_standard else ops.cit_standard
    else:
        ops_cit_rate = ops.cit_standard

    # R&D tax benefit (reduces effective CIT)
    rnd_spend = rev * scenario.rnd_spend_pct / 100.0
    if ops.rnd_benefit >= 100:
        # Super deduction: extra deduction reduces taxable income
        extra_deduction = rnd_spend * (ops.rnd_benefit - 100) / 100.0
        rnd_tax_saving = extra_deduction * ops_cit_rate / 100.0
    else:
        # Tax credit: direct reduction of tax
        rnd_tax_saving = rnd_spend * ops.rnd_benefit / 100.0

    ops_cit = max(0, taxable_profit_ops * ops_cit_rate / 100.0 - rnd_tax_saving)
    ops_after_tax = taxable_profit_ops - ops_cit

    # Payroll burden
    total_payroll = scenario.headcount * scenario.avg_salary
    payroll_tax = total_payroll * ops.payroll_employer / 100.0

    # ── Step 2: Royalty WHT (ops -> ip_hold) ──
    treaty_key = (ops.code, ip_hold.code)
    if ops.code == ip_hold.code:
        royalty_wht_rate = 0.0
    elif treaty_key in TREATY_RATES:
        royalty_wht_rate = TREATY_RATES[treaty_key][2]
    else:
        royalty_wht_rate = ops.wht_royalty

    royalty_wht = ip_royalty * royalty_wht_rate / 100.0
    royalty_net = ip_royalty - royalty_wht

    # ── Step 3: IP holding entity CIT on royalty income ──
    if ip_hold.code == ops.code:
        ip_cit = 0  # Same entity, already taxed
        ip_after_tax = 0
    else:
        ip_cit_rate = ip_hold.cit_standard
        # Pioneer/concessionary rates for IP in SG
        if ip_hold.code == "SG" and ip_hold.ip_concessionary:
            ip_cit_rate = 5.0  # Assume Pioneer Status
        ip_cit = royalty_net * ip_cit_rate / 100.0
        ip_after_tax = royalty_net - ip_cit

    # ── Step 4: Dividend from ops -> holding (incorp) ──
    if ops.code == incorp.code:
        div_wht_ops_to_hold = 0.0
    else:
        treaty_key_div = (ops.code, incorp.code)
        if treaty_key_div in TREATY_RATES:
            div_wht_rate = TREATY_RATES[treaty_key_div][0]
        else:
            div_wht_rate = ops.wht_dividend
        div_wht_ops_to_hold = ops_after_tax * div_wht_rate / 100.0

    # ── Step 5: Dividend from ip_hold -> holding (incorp) ──
    if ip_hold.code == incorp.code or ip_hold.code == ops.code:
        div_wht_ip_to_hold = 0.0
    else:
        treaty_key_ip = (ip_hold.code, incorp.code)
        if treaty_key_ip in TREATY_RATES:
            div_wht_rate_ip = TREATY_RATES[treaty_key_ip][0]
        else:
            div_wht_rate_ip = ip_hold.wht_dividend
        div_wht_ip_to_hold = ip_after_tax * div_wht_rate_ip / 100.0

    # ── Step 6: Holding company receives dividends ──
    total_received_by_hold = (ops_after_tax - div_wht_ops_to_hold) + max(0, ip_after_tax - div_wht_ip_to_hold)

    # Holding CIT on received dividends (participation exemption?)
    hold_cit = 0.0
    if incorp.code == "SG":
        hold_cit = 0.0  # Territorial, one-tier exempt
    elif incorp.code == "US":
        # Section 245A exemption for foreign dividends
        hold_cit = 0.0
    elif incorp.code == "BR":
        hold_cit = 0.0  # Dividends exempt
    elif incorp.code == "AU":
        # Franked = 0; foreign subsidiary dividends via NFI
        hold_cit = 0.0
    elif incorp.code == "CA":
        # Foreign affiliate exempt surplus
        hold_cit = 0.0
    else:
        # General: may be taxed
        hold_cit = total_received_by_hold * incorp.cit_standard * 0.1 / 100.0  # Partial

    hold_after_tax = total_received_by_hold - hold_cit

    # ── Step 7: Distribution to investor ──
    investor_distribution = hold_after_tax * scenario.investor_dividend_pct / 100.0
    if incorp.code == investor_country.code:
        inv_div_wht = 0.0
    else:
        treaty_key_inv = (incorp.code, investor_country.code)
        if treaty_key_inv in TREATY_RATES:
            inv_div_wht_rate = TREATY_RATES[treaty_key_inv][0]
        else:
            inv_div_wht_rate = incorp.wht_dividend
        inv_div_wht = investor_distribution * inv_div_wht_rate / 100.0

    net_to_investor = investor_distribution - inv_div_wht

    # ── Step 8: Exit tax (CGT on share sale) ──
    exit_value = rev * scenario.exit_multiple
    # Investor sells shares in holding company
    cgt_rate = investor_country.cgt_nonresident if investor_country.code != incorp.code else 0.0
    # QSBS exclusion for US
    if incorp.code == "US" and scenario.years_to_exit >= 5:
        cgt_rate = 0.0  # QSBS 100% exclusion
    if incorp.code == "SG":
        cgt_rate = 0.0  # No CGT

    exit_cgt = exit_value * cgt_rate / 100.0

    # ── TOTALS ──
    total_tax = (ops_cit + royalty_wht + ip_cit + div_wht_ops_to_hold +
                 div_wht_ip_to_hold + hold_cit + inv_div_wht + payroll_tax)
    total_income = rev
    effective_rate = (total_tax / total_income * 100.0) if total_income > 0 else 0.0

    # Annualized exit impact
    annual_exit_tax = exit_cgt / scenario.years_to_exit if scenario.years_to_exit > 0 else 0
    total_with_exit = total_tax + annual_exit_tax
    effective_with_exit = (total_with_exit / total_income * 100.0) if total_income > 0 else 0.0

    return {
        "structure": f"Incorp:{incorp.code} | Ops:{ops.code} | IP:{ip_hold.code} | Investor:{investor_country.code}",
        "incorp": incorp.code,
        "ops": ops.code,
        "ip_hold": ip_hold.code,
        "investor": investor_country.code,
        "revenue": rev,
        "ops_cit": round(ops_cit, 2),
        "ops_cit_rate": ops_cit_rate,
        "rnd_tax_saving": round(rnd_tax_saving, 2),
        "royalty_wht": round(royalty_wht, 2),
        "ip_cit": round(ip_cit, 2),
        "div_wht_ops_to_hold": round(div_wht_ops_to_hold, 2),
        "div_wht_ip_to_hold": round(div_wht_ip_to_hold, 2),
        "hold_cit": round(hold_cit, 2),
        "inv_div_wht": round(inv_div_wht, 2),
        "payroll_tax": round(payroll_tax, 2),
        "total_annual_tax": round(total_tax, 2),
        "effective_rate_pct": round(effective_rate, 2),
        "exit_cgt": round(exit_cgt, 2),
        "annual_exit_impact": round(annual_exit_tax, 2),
        "effective_with_exit_pct": round(effective_with_exit, 2),
        "net_to_investor_annual": round(net_to_investor, 2),
    }


def score_incorporation(c: CountryTax) -> float:
    """Score a country for incorporation suitability (0-100)."""
    score = 50.0
    # Low CIT
    score += max(0, (30 - c.cit_standard)) * 1.5
    # No CGT for investors
    score += (10 - c.cgt_nonresident) * 1.0
    # Low dividend WHT outbound
    score += max(0, (30 - c.wht_dividend)) * 0.5
    # No exit tax
    if not c.exit_tax: score += 5
    # Territorial system
    if c.territorial_system: score += 10
    # No/light CFC
    if not c.has_cfc: score += 10
    elif c.cfc_severity == "light": score += 5
    # Treaty network
    score += min(10, c.treaty_count / 10)
    # FX controls
    if c.fx_controls == "none": score += 5
    # Screening
    if c.screening_severity == "minimal": score += 5
    return min(100, max(0, score))


def score_operations(c: CountryTax) -> float:
    """Score a country for operating entity suitability (0-100)."""
    score = 50.0
    # SME rate advantage
    sme_advantage = c.cit_standard - c.cit_sme
    score += sme_advantage * 1.0
    # Low payroll
    score += max(0, (35 - c.payroll_employer)) * 0.5
    # R&D incentives
    if c.rnd_benefit >= 200: score += 15
    elif c.rnd_benefit >= 100: score += 10
    elif c.rnd_benefit >= 30: score += 5
    # NOL flexibility
    if c.nol_carry_forward == "indefinite": score += 5
    if c.nol_limitation >= 80: score += 3
    # Fast IT depreciation
    if c.depreciation_it_years <= 1: score += 8
    elif c.depreciation_it_years <= 3: score += 4
    # Startup expense deduction
    if c.startup_expense_deduction: score += 3
    # No DST
    if not c.digital_services_tax: score += 3
    return min(100, max(0, score))


def score_ip_holding(c: CountryTax) -> float:
    """Score a country for IP holding suitability (0-100)."""
    score = 40.0
    # Low CIT on royalty income
    score += max(0, (30 - c.cit_standard)) * 1.5
    # Patent box / concessionary rates
    if c.ip_concessionary:
        score += 15
    if c.patent_box_rate and c.patent_box_rate < 15:
        score += 10
    # No CGT
    if c.cgt_nonresident == 0: score += 10
    # Low royalty WHT (as source country, lower = better for IP holder)
    score += max(0, (25 - c.wht_royalty)) * 0.5
    # Territorial
    if c.territorial_system: score += 8
    # No CFC
    if not c.has_cfc: score += 8
    # Treaty network for royalty flows
    score += min(8, c.treaty_count / 12)
    return min(100, max(0, score))


def score_investor_friendliness(c: CountryTax) -> float:
    """Score investor-friendliness for foreign investors (0-100)."""
    score = 50.0
    # Low/no CGT on shares
    score += max(0, (20 - c.cgt_nonresident)) * 1.5
    # Low dividend WHT
    score += max(0, (30 - c.wht_dividend)) * 0.8
    # No FX controls
    if c.fx_controls == "none": score += 10
    # No exit tax
    if not c.exit_tax: score += 5
    # Minimal screening
    if c.screening_severity == "minimal": score += 8
    elif c.screening_severity == "moderate": score += 3
    # Treaty network
    score += min(8, c.treaty_count / 12)
    # No branch profits tax
    if c.branch_remittance == 0: score += 5
    return min(100, max(0, score))


# ─────────────────────────────────────────────────────────────────────
# 4. MAIN OPTIMIZATION
# ─────────────────────────────────────────────────────────────────────

def run_optimization():
    print("=" * 100)
    print("  KOLOSAL B2B STARTUP TAX OPTIMIZATION ENGINE")
    print("  7 Countries x All Combinations | Comprehensive Tax Code Analysis")
    print("=" * 100)

    codes = list(COUNTRIES.keys())

    # ── Phase 1: Individual Country Scores ──
    print("\n" + "─" * 100)
    print("  PHASE 1: INDIVIDUAL COUNTRY TAX PROFILES & SCORES")
    print("─" * 100)

    for code in codes:
        c = COUNTRIES[code]
        c.incorporation_score = score_incorporation(c)
        c.operations_score = score_operations(c)
        c.ip_holding_score = score_ip_holding(c)
        c.investor_friendliness = score_investor_friendliness(c)

    # Print country comparison table
    print(f"\n{'Country':<12} {'CIT%':<8} {'SME%':<8} {'VAT%':<8} {'Payroll%':<10} "
          f"{'DivWHT%':<9} {'CGT-NR%':<9} {'R&D':<8} {'Treaties':<9} {'CFC':<12}")
    print("-" * 100)
    for code in codes:
        c = COUNTRIES[code]
        print(f"{c.name:<12} {c.cit_standard:<8.1f} {c.cit_sme:<8.1f} {c.vat_gst:<8.1f} "
              f"{c.payroll_employer:<10.1f} {c.wht_dividend:<9.1f} {c.cgt_nonresident:<9.1f} "
              f"{c.rnd_benefit:<8.0f}% {c.treaty_count:<9} {c.cfc_severity:<12}")

    print(f"\n{'Country':<12} {'Incorp':<12} {'Operations':<12} {'IP Hold':<12} {'Investor':<12}")
    print("-" * 60)
    for code in codes:
        c = COUNTRIES[code]
        print(f"{c.name:<12} {c.incorporation_score:<12.1f} {c.operations_score:<12.1f} "
              f"{c.ip_holding_score:<12.1f} {c.investor_friendliness:<12.1f}")

    # ── Phase 2: SME Regime Deep Dive ──
    print("\n" + "─" * 100)
    print("  PHASE 2: SME / STARTUP TAX REGIMES (Key for B2B Startups)")
    print("─" * 100)
    for code in codes:
        c = COUNTRIES[code]
        print(f"\n  {c.name} ({c.code}):")
        print(f"    Regime: {c.cit_sme_regime}")
        print(f"    Threshold: {c.cit_sme_threshold}")
        print(f"    Effective SME Rate: {c.cit_sme}%  vs  Standard: {c.cit_standard}%")
        print(f"    R&D Incentive: {c.rnd_description}")
        if c.ip_concessionary:
            print(f"    IP Concessionary: {c.ip_concessionary}")

    # ── Phase 3: All Combinations (7^4 = 2401 with investor) ──
    # Optimize: Incorp x Ops x IP_Hold x Investor
    # Reduce to practical: same investor for all (test each investor separately)
    print("\n" + "─" * 100)
    print("  PHASE 3: FULL COMBINATION OPTIMIZATION (7 x 7 x 7 x 7 = 2,401 structures)")
    print("─" * 100)

    scenario = B2BStartupScenario()
    print(f"\n  Scenario: B2B SaaS Startup")
    print(f"    Revenue: ${scenario.annual_revenue:,.0f}/yr")
    print(f"    Profit Margin: {scenario.profit_margin_pct}%")
    print(f"    R&D Spend: {scenario.rnd_spend_pct}% of revenue")
    print(f"    IP Royalty: {scenario.ip_royalty_pct}% of revenue")
    print(f"    Headcount: {scenario.headcount} @ ${scenario.avg_salary:,.0f} avg")
    print(f"    Exit: {scenario.exit_multiple}x revenue in {scenario.years_to_exit} years")

    all_results = []
    for incorp_code in codes:
        for ops_code in codes:
            for ip_code in codes:
                for inv_code in codes:
                    result = compute_effective_tax_chain(
                        COUNTRIES[incorp_code],
                        COUNTRIES[ops_code],
                        COUNTRIES[ip_code],
                        COUNTRIES[inv_code],
                        scenario,
                    )
                    all_results.append(result)

    # Sort by effective rate (with exit)
    all_results.sort(key=lambda x: x["effective_with_exit_pct"])

    # ── Top 25 Structures ──
    print(f"\n  TOP 25 OPTIMAL STRUCTURES (of {len(all_results):,} evaluated)")
    print(f"  {'#':<4} {'Structure':<45} {'Eff.Rate%':<11} {'w/Exit%':<10} "
          f"{'OpsCIT':<10} {'RoyWHT':<9} {'Payroll':<10} {'TotalTax':<12} {'NetInv$':<10}")
    print("  " + "-" * 120)
    for i, r in enumerate(all_results[:25], 1):
        print(f"  {i:<4} {r['structure']:<45} {r['effective_rate_pct']:<11.2f} "
              f"{r['effective_with_exit_pct']:<10.2f} {r['ops_cit']:<10.2f} "
              f"{r['royalty_wht']:<9.2f} {r['payroll_tax']:<10.2f} "
              f"{r['total_annual_tax']:<12.2f} {r['net_to_investor_annual']:<10.2f}")

    # ── Worst 10 Structures ──
    print(f"\n  WORST 10 STRUCTURES (highest tax burden)")
    print(f"  {'#':<4} {'Structure':<45} {'Eff.Rate%':<11} {'w/Exit%':<10} {'TotalTax':<12}")
    print("  " + "-" * 85)
    for i, r in enumerate(all_results[-10:], 1):
        print(f"  {i:<4} {r['structure']:<45} {r['effective_rate_pct']:<11.2f} "
              f"{r['effective_with_exit_pct']:<10.2f} {r['total_annual_tax']:<12.2f}")

    # ── Phase 4: Best structure per investor country ──
    print("\n" + "─" * 100)
    print("  PHASE 4: BEST STRUCTURE PER INVESTOR HOME COUNTRY")
    print("─" * 100)
    for inv_code in codes:
        inv_results = [r for r in all_results if r["investor"] == inv_code]
        inv_results.sort(key=lambda x: x["effective_with_exit_pct"])
        best = inv_results[0]
        print(f"\n  Investor from {COUNTRIES[inv_code].name}:")
        print(f"    Best Structure: {best['structure']}")
        print(f"    Effective Rate: {best['effective_rate_pct']:.2f}%  (with exit: {best['effective_with_exit_pct']:.2f}%)")
        print(f"    Annual Tax: ${best['total_annual_tax']:,.2f}  |  Net to Investor: ${best['net_to_investor_annual']:,.2f}")
        print(f"    Breakdown: OpsCIT=${best['ops_cit']:,.2f} RoyWHT=${best['royalty_wht']:,.2f} "
              f"DivWHT(ops)=${best['div_wht_ops_to_hold']:,.2f} Payroll=${best['payroll_tax']:,.2f}")
        # Top 3 alternatives
        print(f"    Alternatives:")
        for alt in inv_results[1:4]:
            print(f"      -> {alt['structure']}  Rate: {alt['effective_with_exit_pct']:.2f}%")

    # ── Phase 5: Simplified Single-Entity Analysis ──
    print("\n" + "─" * 100)
    print("  PHASE 5: SINGLE-ENTITY STRUCTURES (No IP splitting)")
    print("  (Most practical for early-stage B2B startups)")
    print("─" * 100)

    single_results = [r for r in all_results if r["incorp"] == r["ops"] == r["ip_hold"]]
    single_results.sort(key=lambda x: x["effective_with_exit_pct"])

    print(f"\n  {'#':<4} {'Structure':<45} {'Eff.Rate%':<11} {'w/Exit%':<10} "
          f"{'TotalTax':<12} {'NetInv$':<10}")
    print("  " + "-" * 95)
    for i, r in enumerate(single_results[:20], 1):
        print(f"  {i:<4} {r['structure']:<45} {r['effective_rate_pct']:<11.2f} "
              f"{r['effective_with_exit_pct']:<10.2f} {r['total_annual_tax']:<12.2f} "
              f"{r['net_to_investor_annual']:<10.2f}")

    # ── Phase 6: Key Tax Code References ──
    print("\n" + "─" * 100)
    print("  PHASE 6: TAX CODE LEGAL REFERENCES BY COUNTRY")
    print("─" * 100)

    tax_codes = {
        "US": {
            "Corporate Tax": "IRC Section 11 (21% flat rate)",
            "QSBS Exclusion": "IRC Section 1202 (100% CGT exclusion, 5yr hold, $10M cap)",
            "FDII Deduction": "IRC Section 250 (37.5% deduction -> 13.125% effective on foreign income)",
            "R&D Credit": "IRC Section 41 (20% regular / 14% ASC)",
            "Section 174 Amortization": "5yr domestic / 15yr foreign R&D capitalization",
            "Interest Limitation": "IRC Section 163(j) (30% ATI, exempt <$29M gross receipts)",
            "NOL Rules": "IRC Section 172 (indefinite carry-forward, 80% limitation)",
            "GILTI": "IRC Section 951A (10.5% minimum tax on CFC income)",
            "Subpart F": "IRC Section 951-964",
            "CFIUS Screening": "DPA Title VII; FIRRMA 2018; 31 CFR Parts 800-802",
            "Pass-Through QBI": "IRC Section 199A (20% deduction)",
            "Bonus Depreciation": "IRC Section 168(k) (60% in 2024, phasing down)",
            "Section 179": "IRC Section 179 ($1.22M limit)",
        },
        "SG": {
            "Corporate Tax": "Income Tax Act Section 10(1) (17% headline rate)",
            "SUTE Startup Exemption": "ITA Section 43B (75% exempt first SGD 100K for first 3 YAs)",
            "Partial Tax Exemption": "ITA Section 43 (75% first 10K + 50% next 190K)",
            "One-Tier Dividend": "ITA Section 13(1)(za) (0% WHT on dividends)",
            "No Capital Gains Tax": "ITA Section 10(1) (capital gains not taxable)",
            "Territorial System": "ITA Section 10(25) (foreign income exempt if conditions met)",
            "FSIE Exemption": "ITA Section 13(8) (dividends, branch profits, service income)",
            "EIS R&D Deduction": "ITA Section 14C + EIS (400% enhanced deduction, YA 2024-2028)",
            "Pioneer Status": "Economic Development Board Act (0-5% for 5-15 years)",
            "IP Dev Incentive": "EDB IDI scheme (5-10% on IP income)",
            "Capital Allowances": "ITA Section 19/19A (1-3 year write-off for equipment)",
            "Startup Expenses": "ITA Section 14U (SGD 15K cap on incorporation costs)",
            "DTA Network": "90+ comprehensive treaties",
        },
        "ID": {
            "Corporate Tax": "UU 7/2021 (HPP) Article 17 (22% standard rate)",
            "MSME Final Tax": "PP 55/2022 (0.5% of gross turnover, 4 years for PT)",
            "Article 31E": "50% CIT discount on first IDR 4.8B for companies <IDR 50B revenue",
            "Tax Holiday": "PMK 130/2020 (100% CIT reduction for 5-20 years)",
            "Super Deduction R&D": "PP 45/2019 (200-300% deduction on R&D)",
            "VAT": "UU 7/2021 Article 7 (11%, planned 12% in 2025)",
            "WHT PPh 26": "UU PPh Article 26 (20% default for non-residents)",
            "CFC Rules": "UU PPh Article 18(2) (deemed dividend on 50%+ owned CFCs)",
            "Thin Cap": "PMK 169/2015 (4:1 DER ratio)",
            "BKPM Screening": "UU 25/2007; PP 5/2021; Cipta Kerja Law",
            "NOL": "UU PPh Article 6(2) (5 years, extendable to 10)",
        },
        "CA": {
            "Corporate Tax": "ITA Section 123 (38% base - 10% abatement - 13% GRR = 15%)",
            "SBD": "ITA Section 125 (9% federal on first CAD 500K active income, CCPC)",
            "SR&ED Credit": "ITA Section 127 (35% refundable ITC for CCPCs, first CAD 3M)",
            "EIFEL": "ITA Section 18.2 (30% tax-EBITDA interest limit, from 2024)",
            "NOL": "ITA Section 111(1)(a) (20yr carry-forward, 3yr carry-back)",
            "CCA Depreciation": "ITA Regulation 1100, Schedule II (class-based declining balance)",
            "FAPI CFC": "ITA Section 91 (accrual of passive income from CFAs)",
            "Foreign Affiliate": "ITA Section 113 (exempt surplus on active income)",
            "LCGE": "ITA Section 110.6 (CAD 1.016M lifetime CGT exemption on QSBC shares)",
            "Investment Canada Act": "ICA R.S.C. 1985 c.28 (net benefit review thresholds)",
            "DST": "Digital Services Tax Act 2024 (3% on CAD 20M+ Canadian revenue)",
        },
        "BR": {
            "Corporate Tax": "Lei 9.249/1995 (IRPJ 15% + 10% surtax + CSLL 9% = 34%)",
            "Simples Nacional": "LC 123/2006 (unified 4-33% for micro/small enterprises)",
            "Lucro Presumido": "Lei 9.718/1998 (8-32% presumed margins)",
            "JCP Deduction": "Lei 9.249/1995 Art. 9 (interest on capital, TJLP-based)",
            "Dividend Exemption": "Lei 9.249/1995 Art. 10 (0% WHT on dividends)",
            "Lei do Bem R&D": "Lei 11.196/2005 (160-180% R&D deduction)",
            "NOL": "Lei 9.065/1995 Art. 15 (indefinite carry-forward, 30% annual limit)",
            "Thin Cap": "Lei 12.249/2010 Art. 24 (2:1 DER related party)",
            "Universal CFC": "Lei 12.973/2014 Art. 76-92 (all CFC profits taxed)",
            "Tax Reform": "EC 132/2023 (CBS + IBS replacing PIS/COFINS/ICMS/ISS, 2026-2033)",
            "PIS/COFINS": "Lei 10.637/2002 + Lei 10.833/2003 (9.25% non-cumulative)",
        },
        "MX": {
            "Corporate Tax": "LISR Article 9 (30% flat ISR)",
            "Border Zone": "Decreto 29-Dec-2020 (1/3 ISR credit -> 20% effective in border zones)",
            "RESICO": "LISR Article 113-E (1-2.5% simplified trust for individuals)",
            "R&D Credit": "LISR Article 202 (30% incremental credit, cap MXN 50M)",
            "PTU": "Ley Federal del Trabajo Art. 117-131 (10% profit sharing)",
            "NOL": "LISR Article 57 (10yr carry-forward, inflation-adjusted)",
            "Interest Limitation": "LISR Article 28-XXXII (30% EBITDA + 3:1 thin cap)",
            "REFIPRE CFC": "LISR Article 176-178 (CFC if effective rate <75% of MX rate)",
            "IVA": "LIVA Article 1 (16% standard, 8% border zone)",
            "CNIE Screening": "LIE Articles 10-11 (restricted zone, sector caps)",
            "Dividend WHT": "LISR Article 164 (10% on post-2014 profits)",
        },
        "AU": {
            "Corporate Tax": "ITAA 1997 Section 4-15 (30% general / 25% base rate entity)",
            "Base Rate Entity": "ITAA 1997 Section 23AA (turnover <AUD 50M, <80% passive)",
            "Franking/Imputation": "ITAA 1997 Division 207 (eliminates dividend double-tax)",
            "R&D Tax Incentive": "ITAA 1997 Division 355 (43.5-48.5% offset, refundable for small co)",
            "NOL": "ITAA 1997 Section 36-10 (indefinite carry-forward, 1yr carry-back)",
            "Thin Cap": "ITAA 1997 Division 820 (30% EBITDA / 60% safe harbour)",
            "Part X CFC": "ITAA 1936 Part X (CFC on passive income, 95% active exemption)",
            "FIRB Screening": "FATA 1975 Sections 47, 55-56A",
            "DPT": "TAA Division 177J (40% diverted profits tax on >AUD 1B global)",
            "SBE CGT Concessions": "ITAA 1997 Division 152 (50% reduction, 15yr exemption)",
            "Instant Asset Write-Off": "ITAA 1997 Section 328-180 (AUD 20K threshold, <AUD 10M turnover)",
        },
    }

    for country, refs in tax_codes.items():
        c = COUNTRIES[country]
        print(f"\n  {c.name} ({c.code}) - Key Tax Code References:")
        for name, ref in refs.items():
            print(f"    {name}: {ref}")

    # ── Phase 7: Investment Corridor Analysis (all 42 pairs) ──
    print("\n" + "─" * 100)
    print("  PHASE 7: INVESTMENT CORRIDOR ANALYSIS (42 Country Pairs)")
    print("  Effective tax on $100K profit earned in 'To' country, repatriated to 'From' country")
    print("─" * 100)

    print(f"\n  {'From->To':<12} {'OpsCIT%':<9} {'DivWHT%':<9} {'TotalTax$':<11} {'EffRate%':<10} {'Net$':<10}")
    print("  " + "-" * 65)

    corridor_results = []
    for from_code in codes:
        for to_code in codes:
            if from_code == to_code:
                continue
            from_c = COUNTRIES[from_code]
            to_c = COUNTRIES[to_code]

            profit = 100_000
            # CIT in operating country
            cit = profit * to_c.cit_standard / 100.0
            after_cit = profit - cit

            # Dividend WHT to holding country
            key = (to_code, from_code)
            if key in TREATY_RATES:
                div_wht_rate = TREATY_RATES[key][0]
            else:
                div_wht_rate = to_c.wht_dividend
            div_wht = after_cit * div_wht_rate / 100.0

            total_tax = cit + div_wht
            eff_rate = total_tax / profit * 100
            net = profit - total_tax

            corridor_results.append({
                "from": from_code, "to": to_code,
                "cit_rate": to_c.cit_standard, "div_wht_rate": div_wht_rate,
                "total_tax": total_tax, "eff_rate": eff_rate, "net": net,
            })
            print(f"  {from_code}->{to_code:<7} {to_c.cit_standard:<9.1f} {div_wht_rate:<9.1f} "
                  f"${total_tax:<10,.0f} {eff_rate:<10.1f} ${net:<10,.0f}")

    # Best corridors
    corridor_results.sort(key=lambda x: x["eff_rate"])
    print(f"\n  TOP 10 MOST TAX-EFFICIENT CORRIDORS:")
    print(f"  {'#':<4} {'Corridor':<12} {'EffRate%':<10} {'Net per $100K'}")
    print("  " + "-" * 40)
    for i, cr in enumerate(corridor_results[:10], 1):
        print(f"  {i:<4} {cr['from']}->{cr['to']:<7} {cr['eff_rate']:<10.1f} ${cr['net']:,.0f}")

    # ── Phase 8: Revenue Sensitivity Analysis ──
    print("\n" + "─" * 100)
    print("  PHASE 8: REVENUE SENSITIVITY - BEST SINGLE-ENTITY COUNTRY BY REVENUE TIER")
    print("─" * 100)

    revenue_tiers = [50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000]

    print(f"\n  {'Revenue':<15}", end="")
    for code in codes:
        print(f"{code:<12}", end="")
    print(f"  {'BEST':<12}")
    print("  " + "-" * (15 + 12 * len(codes) + 12))

    for rev_tier in revenue_tiers:
        s = B2BStartupScenario(annual_revenue=rev_tier)
        rates = {}
        for code in codes:
            c = COUNTRIES[code]
            r = compute_effective_tax_chain(c, c, c, c, s)
            rates[code] = r["effective_rate_pct"]

        best_code = min(rates, key=rates.get)
        print(f"  ${rev_tier:<14,}", end="")
        for code in codes:
            marker = " *" if code == best_code else ""
            print(f"{rates[code]:<12.2f}", end="")
        print(f"  {best_code} ({rates[best_code]:.2f}%)")

    # ── Phase 9: Recommendations ──
    print("\n" + "=" * 100)
    print("  OPTIMIZATION RESULTS & RECOMMENDATIONS")
    print("=" * 100)

    # Find overall best
    best_overall = all_results[0]
    best_single = single_results[0]

    print(f"""
  OVERALL BEST MULTI-ENTITY STRUCTURE:
    {best_overall['structure']}
    Effective Rate: {best_overall['effective_rate_pct']:.2f}% (with exit: {best_overall['effective_with_exit_pct']:.2f}%)
    Annual Tax: ${best_overall['total_annual_tax']:,.2f}
    Net to Investor: ${best_overall['net_to_investor_annual']:,.2f}/yr

  BEST SINGLE-ENTITY STRUCTURE (Recommended for Early Stage):
    {best_single['structure']}
    Effective Rate: {best_single['effective_rate_pct']:.2f}% (with exit: {best_single['effective_with_exit_pct']:.2f}%)
    Annual Tax: ${best_single['total_annual_tax']:,.2f}
    Net to Investor: ${best_single['net_to_investor_annual']:,.2f}/yr

  KEY FINDINGS:
    1. Singapore (SG) dominates as incorporation + IP holding due to:
       - 0% capital gains tax, 0% dividend WHT, territorial system
       - SUTE: 4.25% effective rate for first 3 years (on first SGD 100K)
       - EIS: 400% R&D super deduction
       - No CFC rules (critical for holding structures)
       - 90+ treaty network

    2. Indonesia (ID) offers lowest operating costs for early-stage:
       - MSME 0.5% final tax on gross revenue (first 4 years)
       - Lowest effective payroll burden vs. cost-of-living
       - 300% R&D super deduction (with national research body)
       - Tax holidays for larger investments (IDR 100B+)

    3. United States (US) is optimal for:
       - QSBS: 100% capital gains exclusion for founders (5yr hold)
       - FDII: 13.125% rate on foreign-derived intangible income
       - Deepest venture capital market access
       - BUT: aggressive CFC (GILTI/Subpart F) hurts outbound structures

    4. Brazil (BR) paradox: highest payroll (35.8%) but 0% dividend WHT
       - JCP (Interest on Capital) provides ~19% net tax benefit
       - Simples Nacional 4% for micro-commerce

    5. Canada (CA) strong for R&D-heavy startups:
       - SR&ED: 35% refundable ITC (cash back on R&D spend)
       - SBD: 9% federal rate on first CAD 500K
       - LCGE: CAD 1.016M lifetime CGT exemption on QSBC shares

    6. Australia (AU) franking eliminates dividend double-taxation
       - 48.5% refundable R&D offset for small companies
       - 25% base rate entity rate
       - SBE CGT concessions (50% reduction, 15yr full exemption)

  RECOMMENDED STRUCTURES BY STARTUP STAGE:

    Pre-Revenue / MVP Stage:
      -> Singapore SUTE (4.25% effective)
      -> Indonesia MSME (0.5% of gross, if ops there)
      -> US LLC (pass-through, no entity-level tax)

    Growth Stage ($500K-$5M revenue):
      -> SG HoldCo + US OpCo (FDII on SaaS exports)
      -> SG HoldCo + ID OpCo (lowest ops cost)
      -> CA CCPC (SR&ED refundable credits)

    Scale Stage ($5M+ revenue):
      -> SG HoldCo + IP in SG (Pioneer/DEI 5-10%)
      -> US Inc (QSBS for founder exit)
      -> Multi-entity: SG Hold + US Sales + ID Engineering
""")

    print(f"\n  Total structures evaluated: {len(all_results):,}")
    print(f"  Effective rate range: {all_results[0]['effective_with_exit_pct']:.2f}% - {all_results[-1]['effective_with_exit_pct']:.2f}%")
    print("=" * 100)

    return all_results


def run_product_principal_optimization():
    """
    B2B Product Principal Model Optimization
    ==========================================
    The Principal Structure places a "principal entity" in a low-tax jurisdiction
    that owns the IP, bears the entrepreneurial risk, and contracts with
    limited-risk entities (LRDs) in operating countries.

    Structure:
    - Principal Entity: Owns IP, bears risk, earns residual profit
    - Contract Manufacturers / Service Providers: In operating countries (cost+ or TNMM)
    - Sales/Distribution Entities: In market countries (limited risk, routine return)
    - Commissionnaire arrangements where possible

    Key tax considerations:
    - Transfer pricing: arm's length compensation for LRDs
    - Substance requirements: principal must have real decision-making
    - BEPS Action 8-10: alignment of profits with value creation
    - Country-specific anti-avoidance: DPT (AU), BEAT (US)
    """
    print("\n" + "=" * 100)
    print("  KOLOSAL B2B PRODUCT PRINCIPAL TAX OPTIMIZATION ENGINE")
    print("  Principal Structure Analysis for B2B Startups")
    print("=" * 100)

    codes = list(COUNTRIES.keys())

    @dataclass
    class ProductPrincipalScenario:
        global_revenue: float = 5_000_000        # USD
        cogs_pct: float = 25.0                    # Cost of goods/services
        total_opex_pct: float = 40.0              # Operating expenses
        gross_margin_pct: float = 75.0            # B2B SaaS typical
        operating_margin_pct: float = 35.0        # After opex
        rnd_pct: float = 20.0                     # R&D as % of revenue
        # Transfer pricing
        lrd_routine_return_pct: float = 8.0       # Cost-plus 8% for LRDs
        lrd_sales_commission_pct: float = 5.0     # Sales entity commission
        # Revenue split across markets
        market_split: dict = field(default_factory=lambda: {
            "US": 0.35, "SG": 0.05, "ID": 0.10, "CA": 0.10,
            "BR": 0.10, "MX": 0.10, "AU": 0.10, "Other": 0.10
        })
        headcount_by_country: dict = field(default_factory=lambda: {
            "US": 15, "SG": 5, "ID": 20, "CA": 5,
            "BR": 5, "MX": 5, "AU": 5
        })
        avg_salary_by_country: dict = field(default_factory=lambda: {
            "US": 80000, "SG": 60000, "ID": 15000, "CA": 65000,
            "BR": 20000, "MX": 18000, "AU": 70000
        })

    scenario = ProductPrincipalScenario()

    print(f"\n  Scenario: B2B Product Principal (SaaS/Tech)")
    print(f"    Global Revenue: ${scenario.global_revenue:,.0f}")
    print(f"    Gross Margin: {scenario.gross_margin_pct}%")
    print(f"    Operating Margin: {scenario.operating_margin_pct}%")
    print(f"    R&D Spend: {scenario.rnd_pct}% of revenue")
    print(f"    LRD Routine Return: cost + {scenario.lrd_routine_return_pct}%")
    print(f"    Market Split: {scenario.market_split}")

    # ── Compute residual profit for each principal location ──
    print("\n" + "─" * 100)
    print("  PRINCIPAL ENTITY LOCATION ANALYSIS")
    print("  (Residual profit after compensating LRDs at arm's length)")
    print("─" * 100)

    rev = scenario.global_revenue
    rnd_spend = rev * scenario.rnd_pct / 100
    operating_profit = rev * scenario.operating_margin_pct / 100

    principal_results = []

    for principal_code in codes:
        principal = COUNTRIES[principal_code]

        # Step 1: Calculate costs allocated to each LRD country
        total_lrd_cost = 0
        total_lrd_compensation = 0
        total_payroll_tax = 0
        lrd_details = []

        for lrd_code in codes:
            if lrd_code == principal_code:
                continue
            lrd = COUNTRIES[lrd_code]
            hc = scenario.headcount_by_country.get(lrd_code, 0)
            if hc == 0:
                continue
            avg_sal = scenario.avg_salary_by_country.get(lrd_code, 30000)

            # LRD costs (salaries + overhead)
            lrd_payroll = hc * avg_sal
            lrd_overhead = lrd_payroll * 0.3  # 30% overhead
            lrd_total_cost = lrd_payroll + lrd_overhead
            # Arm's length compensation (cost + markup)
            lrd_compensation = lrd_total_cost * (1 + scenario.lrd_routine_return_pct / 100)
            # LRD CIT on markup
            lrd_markup = lrd_compensation - lrd_total_cost
            lrd_cit = lrd_markup * lrd.cit_standard / 100
            # Payroll tax
            lrd_payroll_tax = lrd_payroll * lrd.payroll_employer / 100

            total_lrd_cost += lrd_total_cost
            total_lrd_compensation += lrd_compensation
            total_payroll_tax += lrd_payroll_tax

            lrd_details.append({
                "country": lrd_code, "headcount": hc,
                "cost": lrd_total_cost, "compensation": lrd_compensation,
                "markup": lrd_markup, "cit": lrd_cit,
                "payroll_tax": lrd_payroll_tax,
            })

        # Principal's own headcount costs
        principal_hc = scenario.headcount_by_country.get(principal_code, 0)
        principal_salary = scenario.avg_salary_by_country.get(principal_code, 50000)
        principal_payroll = principal_hc * principal_salary
        principal_payroll_tax = principal_payroll * principal.payroll_employer / 100
        principal_overhead = principal_payroll * 0.3

        # Step 2: Residual profit to principal
        # Revenue - LRD compensation - principal's own costs - R&D
        principal_rnd = rnd_spend  # Principal bears R&D cost
        residual_profit = (operating_profit - total_lrd_compensation
                          - principal_payroll - principal_overhead
                          + total_lrd_cost)  # Add back because operating_profit already deducted costs

        # Simplified: residual = operating_profit - sum of routine returns to LRDs
        total_routine_returns = sum(d["markup"] for d in lrd_details)
        residual_profit = operating_profit - total_routine_returns

        # Step 3: Principal CIT
        # R&D deduction benefit
        if principal.rnd_benefit >= 100:
            extra_deduction = rnd_spend * (principal.rnd_benefit - 100) / 100
            rnd_tax_saving = extra_deduction * principal.cit_standard / 100
        else:
            rnd_tax_saving = rnd_spend * principal.rnd_benefit / 100

        # IP concessionary rate
        if principal.code == "SG" and principal.ip_concessionary:
            principal_cit_rate = 5.0  # Pioneer/DEI
        elif principal.code == "US":
            # FDII: 13.125% on foreign-derived income
            foreign_pct = 1 - scenario.market_split.get("US", 0.35)
            domestic_profit = residual_profit * scenario.market_split.get("US", 0.35)
            foreign_profit = residual_profit * foreign_pct
            principal_cit_us = (domestic_profit * 21.0 / 100 +
                               foreign_profit * 13.125 / 100 -
                               rnd_tax_saving)
            principal_cit_rate = (principal_cit_us / residual_profit * 100) if residual_profit > 0 else 21.0
        elif principal.code == "ID" and residual_profit > 0:
            # Tax holiday possible for large investment
            principal_cit_rate = 22.0  # Standard; tax holiday requires IDR 100B+
        else:
            principal_cit_rate = principal.cit_standard

        if principal.code == "US":
            principal_cit = max(0, principal_cit_us)
        else:
            principal_cit = max(0, residual_profit * principal_cit_rate / 100 - rnd_tax_saving)

        # Step 4: Royalty WHT on intercompany payments (LRDs -> Principal)
        total_royalty_wht = 0
        for lrd_code in codes:
            if lrd_code == principal_code:
                continue
            market_rev = rev * scenario.market_split.get(lrd_code, 0)
            royalty = market_rev * 0.05  # 5% royalty from each market entity
            treaty_key = (lrd_code, principal_code)
            if treaty_key in TREATY_RATES:
                wht_rate = TREATY_RATES[treaty_key][2]
            else:
                wht_rate = COUNTRIES[lrd_code].wht_royalty
            total_royalty_wht += royalty * wht_rate / 100

        # Step 5: Dividend repatriation (assume SG/US investors)
        # Dividends from principal to ultimate parent/investors
        after_tax_profit = residual_profit - principal_cit
        div_wht_to_investors = after_tax_profit * principal.wht_dividend / 100

        # Step 6: Total taxes
        total_lrd_cit = sum(d["cit"] for d in lrd_details)
        total_lrd_payroll = sum(d["payroll_tax"] for d in lrd_details)

        total_tax = (principal_cit + total_lrd_cit + total_royalty_wht +
                     total_lrd_payroll + principal_payroll_tax + div_wht_to_investors)
        effective_rate = total_tax / rev * 100 if rev > 0 else 0

        principal_results.append({
            "principal": principal_code,
            "residual_profit": round(residual_profit, 2),
            "principal_cit": round(principal_cit, 2),
            "principal_cit_eff_rate": round(principal_cit_rate, 2),
            "rnd_tax_saving": round(rnd_tax_saving, 2),
            "total_lrd_cit": round(total_lrd_cit, 2),
            "total_royalty_wht": round(total_royalty_wht, 2),
            "total_payroll_tax": round(total_lrd_payroll + principal_payroll_tax, 2),
            "div_wht": round(div_wht_to_investors, 2),
            "total_tax": round(total_tax, 2),
            "effective_rate": round(effective_rate, 2),
            "after_tax_profit": round(after_tax_profit, 2),
            "lrd_details": lrd_details,
        })

    principal_results.sort(key=lambda x: x["effective_rate"])

    print(f"\n  {'#':<4} {'Principal':<12} {'Residual$':<14} {'PrinCIT$':<12} {'LRD CIT$':<11} "
          f"{'RoyWHT$':<10} {'Payroll$':<12} {'DivWHT$':<10} {'TotalTax$':<13} {'EffRate%':<10}")
    print("  " + "-" * 110)
    for i, r in enumerate(principal_results, 1):
        print(f"  {i:<4} {COUNTRIES[r['principal']].name:<12} "
              f"${r['residual_profit']:<13,.0f} ${r['principal_cit']:<11,.0f} "
              f"${r['total_lrd_cit']:<10,.0f} ${r['total_royalty_wht']:<9,.0f} "
              f"${r['total_payroll_tax']:<11,.0f} ${r['div_wht']:<9,.0f} "
              f"${r['total_tax']:<12,.0f} {r['effective_rate']:<10.2f}")

    # ── Principal Location Deep Dive ──
    print("\n" + "─" * 100)
    print("  PRINCIPAL LOCATION DEEP DIVE")
    print("─" * 100)

    for r in principal_results[:3]:
        pc = COUNTRIES[r["principal"]]
        print(f"\n  === {pc.name} as Principal ===")
        print(f"    Residual Profit: ${r['residual_profit']:,.0f}")
        print(f"    Principal CIT: ${r['principal_cit']:,.0f} (effective {r['principal_cit_eff_rate']:.1f}%)")
        print(f"    R&D Tax Saving: ${r['rnd_tax_saving']:,.0f}")
        print(f"    Total Effective Rate: {r['effective_rate']:.2f}%")
        print(f"    Key Advantages:")
        if pc.code == "SG":
            print(f"      - Pioneer Status / DEI: 5-10% concessionary rate on IP income")
            print(f"      - 0% dividend WHT (one-tier system)")
            print(f"      - No CFC rules (territorial system)")
            print(f"      - 400% EIS R&D deduction")
            print(f"      - 0% CGT on share disposal")
            print(f"      Legal: ITA §13(8), EDB Pioneer Certificate, ITA §14C")
        elif pc.code == "US":
            print(f"      - FDII: 13.125% effective on foreign-derived intangible income")
            print(f"      - QSBS: 100% CGT exclusion (IRC §1202)")
            print(f"      - Deep VC/PE ecosystem access")
            print(f"      - BUT: 30% WHT on outbound dividends (treaty-reduced)")
            print(f"      Legal: IRC §250 (FDII), §41 (R&D), §1202 (QSBS)")
        elif pc.code == "ID":
            print(f"      - MSME 0.5% final tax (PP 55/2022)")
            print(f"      - 300% R&D super deduction (PP 45/2019)")
            print(f"      - Tax holiday potential (PMK 130/2020)")
            print(f"      - BUT: 20% WHT on dividends, moderate FX controls")
            print(f"      Legal: UU HPP Art. 17, PP 55/2022, PMK 130/2020")
        elif pc.code == "CA":
            print(f"      - SR&ED: 35% refundable ITC (ITA §127)")
            print(f"      - SBD: 9% federal on first CAD 500K (ITA §125)")
            print(f"      - LCGE: CAD 1.016M CGT exemption (ITA §110.6)")
            print(f"      - BUT: 25% default WHT, FAPI CFC rules")
        elif pc.code == "BR":
            print(f"      - 0% dividend WHT outbound")
            print(f"      - JCP mechanism reduces effective CIT")
            print(f"      - BUT: 34% CIT, 35.8% payroll, universal CFC")
            print(f"      Legal: Lei 9.249/1995, Lei 12.973/2014")
        elif pc.code == "MX":
            print(f"      - Border zone: 20% effective rate")
            print(f"      - 30% R&D incremental credit")
            print(f"      - BUT: 30% CIT, 10% div WHT, high IMSS")
            print(f"      Legal: LISR Art. 9, Decreto Border Zone")
        elif pc.code == "AU":
            print(f"      - Franking: 0% effective div WHT on franked dividends")
            print(f"      - 48.5% R&D offset (refundable for small co)")
            print(f"      - BUT: 30% CIT, DPT 40% anti-avoidance")
            print(f"      Legal: ITAA 1997 Div 207, Div 355, TAA Div 177J")

    # ── TP Substance Requirements ──
    print("\n" + "─" * 100)
    print("  TRANSFER PRICING & SUBSTANCE REQUIREMENTS BY COUNTRY")
    print("─" * 100)

    tp_requirements = {
        "SG": {
            "TP Documentation": "Contemporaneous documentation required (ITA §34F)",
            "CbCR Threshold": "SGD 1.125B group revenue",
            "APA": "Available (unilateral, bilateral, multilateral)",
            "Substance": "Must have qualified staff making key decisions in SG",
            "Key Risk": "BEPS Pillar 2 (15% minimum from Jan 2025 for >EUR 750M groups)",
            "Anti-Avoidance": "General anti-avoidance (ITA §33), substance-over-form",
        },
        "US": {
            "TP Documentation": "Required (IRC §6662(e), Reg. §1.6662-6)",
            "CbCR Threshold": "USD 850M group revenue",
            "APA": "Available (Rev. Proc. 2015-41)",
            "Substance": "FDII requires domestic nexus; Subpart F/GILTI for CFCs",
            "Key Risk": "BEAT (10% minimum tax on base erosion payments >$500M)",
            "Anti-Avoidance": "Economic substance doctrine, step transaction doctrine",
        },
        "ID": {
            "TP Documentation": "Master file + local file required (PMK 213/2016)",
            "CbCR Threshold": "IDR 11T group revenue",
            "APA": "Available (PMK 7/2015)",
            "Substance": "BKPM licensing, minimum investment IDR 10B",
            "Key Risk": "DGT aggressive on TP adjustments; DER 4:1 enforced",
            "Anti-Avoidance": "Anti-avoidance (UU PPh Art. 18), beneficial ownership",
        },
        "CA": {
            "TP Documentation": "Contemporaneous documentation (ITA §247)",
            "CbCR Threshold": "EUR 750M group revenue",
            "APA": "Available (IC 94-4R)",
            "Substance": "CCPC must be Canadian-controlled for SBD/SR&ED",
            "Key Risk": "EIFEL 30% interest limit; FAPI accrual for passive CFC income",
            "Anti-Avoidance": "GAAR (ITA §245), recharacterization provisions",
        },
        "BR": {
            "TP Documentation": "New regime (Lei 14.596/2023) arm's length from Jan 2024",
            "CbCR Threshold": "BRL 2.26B group revenue",
            "APA": "Not available (but TP simplification methods exist)",
            "Substance": "RDE-IED registration, Central Bank compliance",
            "Key Risk": "Universal CFC (all foreign subsidiary profits taxed)",
            "Anti-Avoidance": "CIDE 10% on royalty/service remittances abroad",
        },
        "MX": {
            "TP Documentation": "Required (LISR Art. 76-IX, Art. 76-A)",
            "CbCR Threshold": "MXN 13B group revenue",
            "APA": "Available (CFF Art. 34-A)",
            "Substance": "RNIE registration, maquiladora safe harbour",
            "Key Risk": "REFIPRE CFC if rate <75% of Mexican rate (22.5%)",
            "Anti-Avoidance": "General anti-avoidance (CFF Art. 5-A), substance required",
        },
        "AU": {
            "TP Documentation": "Required (ITAA 1997 Subdiv 815-B)",
            "CbCR Threshold": "AUD 1B group revenue",
            "APA": "Available (PS LA 2015/4)",
            "Substance": "Real economic substance required for TP outcomes",
            "Key Risk": "DPT 40% (>AUD 1B global); MAAL for significant global entities",
            "Anti-Avoidance": "Part IVA GAAR, DPT, MAAL",
        },
    }

    for code in codes:
        c = COUNTRIES[code]
        tp = tp_requirements.get(code, {})
        print(f"\n  {c.name} ({c.code}):")
        for key, val in tp.items():
            print(f"    {key}: {val}")

    # ── Final Product Principal Recommendations ──
    print("\n" + "=" * 100)
    print("  PRODUCT PRINCIPAL OPTIMIZATION RECOMMENDATIONS")
    print("=" * 100)

    best = principal_results[0]
    second = principal_results[1]
    third = principal_results[2]

    print(f"""
  OPTIMAL PRINCIPAL STRUCTURES (B2B Product):

  #1 RECOMMENDED: {COUNTRIES[best['principal']].name} as Principal
     Effective Rate: {best['effective_rate']:.2f}%
     Total Tax on ${rev:,.0f} revenue: ${best['total_tax']:,.0f}
     After-Tax Profit: ${best['after_tax_profit']:,.0f}

  #2 ALTERNATIVE: {COUNTRIES[second['principal']].name} as Principal
     Effective Rate: {second['effective_rate']:.2f}%
     Total Tax: ${second['total_tax']:,.0f}

  #3 ALTERNATIVE: {COUNTRIES[third['principal']].name} as Principal
     Effective Rate: {third['effective_rate']:.2f}%
     Total Tax: ${third['total_tax']:,.0f}

  RECOMMENDED PRODUCT PRINCIPAL ARCHITECTURES:

  Architecture A: Singapore Principal (Optimal for most B2B)
  ┌─────────────────────────────────────────┐
  │  SG Principal Entity (Pioneer 5%)       │
  │  - Owns all IP, bears entrepreneurial   │
  │    risk, makes key decisions             │
  │  - R&D center: EIS 400% deduction       │
  │  - Receives residual profit             │
  │  - 0% dividend WHT to investors         │
  ├─────────────────────────────────────────┤
  │  LRDs (Cost + 8% markup):              │
  │  - US Sales Co (FDII on re-exports)    │
  │  - ID Dev Center (lowest eng cost)     │
  │  - CA R&D Unit (SR&ED 35% credit)      │
  │  - AU Sales Co (franking benefits)     │
  │  - BR Sales Co (0% div, JCP benefit)   │
  │  - MX Ops (border zone 20% rate)       │
  └─────────────────────────────────────────┘
  Tax Code: ITA §13(8), EDB Pioneer, ITA §14C

  Architecture B: US Principal (Best for US-centric B2B)
  ┌─────────────────────────────────────────┐
  │  US Principal Entity                    │
  │  - FDII 13.125% on foreign income       │
  │  - QSBS 100% CGT exclusion for exit    │
  │  - Deep VC ecosystem access             │
  ├─────────────────────────────────────────┤
  │  LRDs:                                  │
  │  - SG Regional HQ (territorial)         │
  │  - ID Dev Center (0.5% MSME)           │
  │  - CA R&D Unit (SR&ED credits)         │
  │  - MX Near-shore Ops (border zone)     │
  └─────────────────────────────────────────┘
  Tax Code: IRC §250 (FDII), §1202 (QSBS), §41 (R&D)

  Architecture C: Dual Principal (SG Hold + US Principal)
  ┌─────────────────────────────────────────┐
  │  SG Holding Co (0% div, no CGT)        │
  │  └── US Principal (FDII 13.125%)       │
  │      └── LRDs worldwide                │
  │                                         │
  │  IP split: Core IP in SG, market-      │
  │  specific in US. Cost-sharing §482.    │
  └─────────────────────────────────────────┘
  Tax Code: ITA §13(8) + IRC §250 + §482 CSA

  CRITICAL COMPLIANCE NOTES:
  - BEPS Pillar 2: 15% minimum effective tax for groups >EUR 750M revenue
  - OECD TP Guidelines 2022: profits must align with value creation
  - Substance requirements: real employees, real decisions in principal location
  - BEAT (US): 10% minimum tax if base erosion payments >$500M rev
  - DPT (AU): 40% penalty tax on diverted profits for large MNEs
  - Documentation: maintain contemporaneous TP documentation in all jurisdictions
""")

    return principal_results


if __name__ == "__main__":
    results = run_optimization()
    pp_results = run_product_principal_optimization()
