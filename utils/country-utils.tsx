import * as CountryFlags from "country-flag-icons/react/3x2";
import React from "react";

export const getCountryFlag = (countryName?: string): React.ReactElement | null => {
  if (!countryName) return null;
  
  // Map country names to ISO codes (case-insensitive)
  const countryToISO: Record<string, string> = {
    'iran': 'IR', 'china': 'CN', 'turkey': 'TR', 'italy': 'IT', 'spain': 'ES',
    'india': 'IN', 'brazil': 'BR', 'egypt': 'EG', 'greece': 'GR', 'portugal': 'PT',
    'united states': 'US', 'united kingdom': 'GB', 'germany': 'DE', 'france': 'FR',
    'canada': 'CA', 'australia': 'AU', 'japan': 'JP', 'south korea': 'KR',
    'russia': 'RU', 'mexico': 'MX', 'argentina': 'AR', 'chile': 'CL', 'peru': 'PE',
    'colombia': 'CO', 'venezuela': 'VE', 'uruguay': 'UY', 'paraguay': 'PY',
    'bolivia': 'BO', 'ecuador': 'EC', 'guyana': 'GY', 'suriname': 'SR',
    'french guiana': 'GF', 'falkland islands': 'FK', 'south georgia': 'GS',
    'bouvet island': 'BV', 'heard island': 'HM', 'south sandwich islands': 'SH',
    'antarctica': 'AQ', 'afghanistan': 'AF', 'albania': 'AL', 'algeria': 'DZ',
    'andorra': 'AD', 'angola': 'AO', 'antigua and barbuda': 'AG', 'azerbaijan': 'AZ',
    'bahamas': 'BS', 'bahrain': 'BH', 'bangladesh': 'BD', 'barbados': 'BB',
    'belarus': 'BY', 'belgium': 'BE', 'belize': 'BZ', 'benin': 'BJ', 'bhutan': 'BT',
    'bosnia and herzegovina': 'BA', 'botswana': 'BW', 'brunei': 'BN', 'burkina faso': 'BF',
    'burundi': 'BI', 'cambodia': 'KH', 'cameroon': 'CM', 'cape verde': 'CV',
    'central african republic': 'CF', 'chad': 'TD', 'comoros': 'KM', 'congo': 'CG',
    'costa rica': 'CR', 'croatia': 'HR', 'cuba': 'CU', 'cyprus': 'CY',
    'czech republic': 'CZ', 'denmark': 'DK', 'djibouti': 'DJ', 'dominica': 'DM',
    'dominican republic': 'DO', 'east timor': 'TL', 'el salvador': 'SV',
    'equatorial guinea': 'GQ', 'eritrea': 'ER', 'estonia': 'EE', 'ethiopia': 'ET',
    'fiji': 'FJ', 'finland': 'FI', 'gabon': 'GA', 'gambia': 'GM', 'georgia': 'GE',
    'ghana': 'GH', 'grenada': 'GD', 'guatemala': 'GT', 'guinea': 'GN',
    'guinea-bissau': 'GW', 'haiti': 'HT', 'honduras': 'HN', 'hungary': 'HU',
    'iceland': 'IS', 'indonesia': 'ID', 'iraq': 'IQ', 'ireland': 'IE', 'israel': 'IL',
    'jamaica': 'JM', 'jordan': 'JO', 'kazakhstan': 'KZ', 'kenya': 'KE',
    'kiribati': 'KI', 'kuwait': 'KW', 'kyrgyzstan': 'KG', 'laos': 'LA',
    'latvia': 'LV', 'lebanon': 'LB', 'lesotho': 'LS', 'liberia': 'LR', 'libya': 'LY',
    'liechtenstein': 'LI', 'lithuania': 'LT', 'luxembourg': 'LU', 'madagascar': 'MG',
    'malawi': 'MW', 'malaysia': 'MY', 'maldives': 'MV', 'mali': 'ML', 'malta': 'MT',
    'marshall islands': 'MH', 'mauritania': 'MR', 'mauritius': 'MU', 'micronesia': 'FM',
    'moldova': 'MD', 'monaco': 'MC', 'mongolia': 'MN', 'montenegro': 'ME',
    'morocco': 'MA', 'mozambique': 'MZ', 'myanmar': 'MM', 'namibia': 'NA',
    'nauru': 'NR', 'nepal': 'NP', 'netherlands': 'NL', 'new zealand': 'NZ',
    'nicaragua': 'NI', 'niger': 'NE', 'nigeria': 'NG', 'north korea': 'KP',
    'north macedonia': 'MK', 'norway': 'NO', 'oman': 'OM', 'palau': 'PW',
    'panama': 'PA', 'papua new guinea': 'PG', 'poland': 'PL', 'qatar': 'QA',
    'romania': 'RO', 'rwanda': 'RW', 'saint kitts and nevis': 'KN', 'saint lucia': 'LC',
    'saint vincent and the grenadines': 'VC', 'samoa': 'WS', 'san marino': 'SM',
    'sao tome and principe': 'ST', 'saudi arabia': 'SA', 'senegal': 'SN',
    'serbia': 'RS', 'seychelles': 'SC', 'sierra leone': 'SL', 'singapore': 'SG',
    'slovakia': 'SK', 'slovenia': 'SI', 'solomon islands': 'SB', 'somalia': 'SO',
    'south africa': 'ZA', 'sri lanka': 'LK', 'sudan': 'SD', 'sweden': 'SE',
    'switzerland': 'CH', 'syria': 'SY', 'taiwan': 'TW', 'tajikistan': 'TJ',
    'tanzania': 'TZ', 'thailand': 'TH', 'togo': 'TG', 'tonga': 'TO',
    'trinidad and tobago': 'TT', 'tunisia': 'TN', 'turkmenistan': 'TM',
    'tuvalu': 'TV', 'uganda': 'UG', 'ukraine': 'UA', 'united arab emirates': 'AE',
    'uzbekistan': 'UZ', 'vanuatu': 'VU', 'vatican city': 'VA', 'vietnam': 'VN',
    'yemen': 'YE', 'zambia': 'ZM', 'zimbabwe': 'ZW'
  };
  
  const normalizedCountryName = countryName.toLowerCase();
  const isoCode = countryToISO[normalizedCountryName];
  
  if (!isoCode) {
    // Fallback - show country initials
    return React.createElement('div', {
      className: "w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center"
    }, React.createElement('span', {
      className: "text-white text-xs font-bold"
    }, countryName.substring(0, 2).toUpperCase()));
  }
  
  const FlagComponent = (CountryFlags as any)[isoCode];
  return FlagComponent ? React.createElement(FlagComponent, { className: "w-4 h-4" }) : null;
}; 