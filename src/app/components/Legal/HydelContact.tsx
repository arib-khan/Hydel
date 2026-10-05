import { BUSINESS } from '@/lib/legal/config';

/** Contact block built only from verified values in BUSINESS (null values are omitted). */
export default function HydelContact() {
  return (
    <ul>
      <li><strong>{BUSINESS.legalEntityName ?? BUSINESS.tradeName}</strong>{BUSINESS.legalEntityName ? ` (trading as ${BUSINESS.tradeName})` : ''}</li>
      <li>{BUSINESS.registeredAddress ?? BUSINESS.locality}</li>
      <li>Email: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></li>
      <li>Hours: {BUSINESS.workingHours}</li>
      {BUSINESS.gstin && <li>GSTIN: {BUSINESS.gstin}</li>}
      {BUSINESS.cin && <li>CIN: {BUSINESS.cin}</li>}
    </ul>
  );
}
