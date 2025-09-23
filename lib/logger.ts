import log4js from "log4js";
import log4jsJsonLayout from "log4js-json-layout";

log4js.addLayout('json', log4jsJsonLayout);
log4js.configure({
  appenders: { out: { type: 'stdout', layout: { type: 'json' } } },
  categories: { default: { appenders: ['out'], level: 'info' } },
});

const logger = log4js.getLogger();
logger.level = 'info';

export default logger;