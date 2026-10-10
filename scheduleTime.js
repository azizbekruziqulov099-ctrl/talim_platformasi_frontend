// All personal lesson times come from the single weekly schedule settings.
export function paraVaqti(para, settings = {}) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(settings.boshlanish || '');
  const start = match ? Number(match[1]) * 60 + Number(match[2]) : 510;
  const duration = Number.isFinite(Number(settings.para_daqiqa)) && Number(settings.para_daqiqa) >= 30 ? Number(settings.para_daqiqa) : 80;
  const gap = settings.tanaffus_daqiqa != null && Number.isFinite(Number(settings.tanaffus_daqiqa)) && Number(settings.tanaffus_daqiqa) >= 0 ? Number(settings.tanaffus_daqiqa) : 10;
  const number = Number.isInteger(Number(para.raqam)) ? Number(para.raqam) : 1;
  const minutes = start + (number - 1) * (duration + gap);
  const format = value => {
    const day = ((value % 1440) + 1440) % 1440;
    return `${String(Math.floor(day / 60)).padStart(2, '0')}:${String(day % 60).padStart(2, '0')}`;
  };
  return `${format(minutes)}–${format(minutes + duration)}`;
}
