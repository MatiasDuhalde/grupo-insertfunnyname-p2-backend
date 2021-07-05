const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

module.exports = function mailers(app) {
  if (process.env.NODE_ENV !== 'test') {
    const transport = nodemailer.createTransport(emailConfig.provider, emailConfig.defaults);
    // eslint-disable-next-line no-param-reassign
    app.context.sendMail = async function sendMail(emailName, options, templateContext) {
      const html = await this.render(`emails/${emailName}`, {
        ...templateContext,
        layout: false,
        writeResp: false,
      });
      return transport.sendMail({ ...options, html });
    };
  } else {
    // eslint-disable-next-line no-param-reassign
    app.context.sendMail = async function sendMail() {
      return new Promise((resolve) => resolve());
    };
  }
};
