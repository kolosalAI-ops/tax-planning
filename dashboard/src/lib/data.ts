import usData from '../data/us.json';
import idData from '../data/indonesia.json';
import caData from '../data/canada.json';
import brData from '../data/brazil.json';
import mxData from '../data/mexico.json';
import auData from '../data/australia.json';
import sgData from '../data/singapore.json';
import { CountryCode, CountryData } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
const allData: Record<CountryCode, CountryData> = {
  US: usData as any,
  ID: idData as any,
  CA: caData as any,
  BR: brData as any,
  MX: mxData as any,
  AU: auData as any,
  SG: sgData as any,
};

export default allData;

export function getCountryData(code: CountryCode): CountryData {
  return allData[code];
}
