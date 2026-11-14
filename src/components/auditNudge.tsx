import { GoArrowRight } from 'react-icons/go';
import { Link } from 'react-router-dom';
import { AUDIT_PATH } from '../data/audit';

/** A line pointing businesses that already have a website to the free
 *  audit (on the area and industry pages; styled in areaPage.css). */
export function AuditNudge() {
  return (
    <p className='audit-nudge'>
      Already have a website?{' '}
      <Link to={AUDIT_PATH}>
        See what it’s costing you with a free audit <GoArrowRight aria-hidden />
      </Link>
    </p>
  );
}
