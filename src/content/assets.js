import creator1519 from '../assets/images/creators/img-1519.png';
import creator1520 from '../assets/images/creators/img-1520.png';

import collapsed1 from '../assets/images/program-collapsed/webinar-1.webp';
import collapsed2 from '../assets/images/program-collapsed/webinar-2.webp';
import collapsed3 from '../assets/images/program-collapsed/webinar-3.webp';
import collapsed4 from '../assets/images/program-collapsed/webinar-4.webp';
import collapsed5 from '../assets/images/program-collapsed/webinar-5.webp';
import collapsed6 from '../assets/images/program-collapsed/webinar-6.webp';

import webinarExpanded1 from '../assets/images/program-expanded/webinar-1.webp';
import webinarExpanded2 from '../assets/images/program-expanded/webinar-2.webp';
import webinarExpanded3 from '../assets/images/program-expanded/webinar-3.webp';
import webinarExpanded4 from '../assets/images/program-expanded/webinar-4.webp';
import webinarExpanded5 from '../assets/images/program-expanded/webinar-5.webp';
import webinarExpanded6 from '../assets/images/program-expanded/webinar-6.webp';

const imageAssets = {
  'creators/img-1519.png': creator1519,
  'creators/img-1520.png': creator1520,
  'program-collapsed/webinar-1.webp': collapsed1,
  'program-collapsed/webinar-2.webp': collapsed2,
  'program-collapsed/webinar-3.webp': collapsed3,
  'program-collapsed/webinar-4.webp': collapsed4,
  'program-collapsed/webinar-5.webp': collapsed5,
  'program-collapsed/webinar-6.webp': collapsed6,
  'program-expanded/webinar-1.webp': webinarExpanded1,
  'program-expanded/webinar-2.webp': webinarExpanded2,
  'program-expanded/webinar-3.webp': webinarExpanded3,
  'program-expanded/webinar-4.webp': webinarExpanded4,
  'program-expanded/webinar-5.webp': webinarExpanded5,
  'program-expanded/webinar-6.webp': webinarExpanded6
};

export function resolveImageAsset(relativePath) {
  const normalizedPath = String(relativePath || '').replace(/^\.?\//, '');
  return imageAssets[normalizedPath] || '';
}
