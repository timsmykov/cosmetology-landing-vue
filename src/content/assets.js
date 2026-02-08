import creator1519 from '../assets/images/creators/img-1519.png';
import creator1520 from '../assets/images/creators/img-1520.png';

import collapsed1 from '../assets/images/program-collapsed/webinar-1.jpg';
import collapsed2 from '../assets/images/program-collapsed/webinar-2.jpg';
import collapsed3 from '../assets/images/program-collapsed/webinar-3.jpg';
import collapsed4 from '../assets/images/program-collapsed/webinar-4.jpg';
import collapsed5 from '../assets/images/program-collapsed/webinar-5.jpg';
import collapsed6 from '../assets/images/program-collapsed/webinar-6.jpg';

import webinarExpanded1 from '../assets/images/program-expanded/webinar-1.jpg';
import webinarExpanded2 from '../assets/images/program-expanded/webinar-2.jpg';
import webinarExpanded3 from '../assets/images/program-expanded/webinar-3.jpg';
import webinarExpanded4 from '../assets/images/program-expanded/webinar-4.jpg';
import webinarExpanded5 from '../assets/images/program-expanded/webinar-5.jpg';
import webinarExpanded6 from '../assets/images/program-expanded/webinar-6.jpg';

const imageAssets = {
  'creators/img-1519.png': creator1519,
  'creators/img-1520.png': creator1520,
  'program-collapsed/webinar-1.png': collapsed1,
  'program-collapsed/webinar-2.png': collapsed2,
  'program-collapsed/webinar-3.png': collapsed3,
  'program-collapsed/webinar-4.png': collapsed4,
  'program-collapsed/webinar-5.png': collapsed5,
  'program-collapsed/webinar-6.png': collapsed6,
  'program-expanded/webinar-1.png': webinarExpanded1,
  'program-expanded/webinar-2.png': webinarExpanded2,
  'program-expanded/webinar-3.png': webinarExpanded3,
  'program-expanded/webinar-4.png': webinarExpanded4,
  'program-expanded/webinar-5.png': webinarExpanded5,
  'program-expanded/webinar-6.png': webinarExpanded6
};

export function resolveImageAsset(relativePath) {
  const normalizedPath = String(relativePath || '').replace(/^\.?\//, '');
  return imageAssets[normalizedPath] || '';
}
