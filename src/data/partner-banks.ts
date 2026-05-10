// Mortgage partner banks. Used on /, /kontakti, and any page that lists
// partners. Update here only — the pages import this list.

export interface PartnerBank {
  name: string;
  logo: string;
  url: string;
}

export const partnerBanks: PartnerBank[] = [
  {
    name: 'Bigbank',
    logo: '/images/logos/bigbank.jpg',
    url: 'https://www.bigbank.lv/partneru-majokla-piedavajumi/',
  },
  {
    name: 'Citadele',
    logo: '/images/logos/citadele.jpg',
    url: 'https://www.citadele.lv/lv/private/mortgage/',
  },
  {
    name: 'Luminor',
    logo: '/images/logos/luminor.jpg',
    url: 'https://luminor.lv/lv/privatpersonam/acm-project#alma-home',
  },
  {
    name: 'Swedbank',
    logo: '/images/logos/swedbank.jpg',
    url: 'https://swedbank.lv/private/credit/loans/home',
  },
  {
    name: 'SEB',
    logo: '/images/logos/seb.jpg',
    url: 'https://www.seb.lv/privatpersonam/krediti/majokla-kredits#appform_loan_private_home',
  },
];
