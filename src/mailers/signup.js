const { clientUrls } = require('../routes/utils/client');

const sendWelcomeEmail = (ctx, to, data) => {
  const templateContext = { ...data, clientUrls };
  return ctx.sendMail('signup-email', { to }, templateContext);
};

module.exports = {
  sendWelcomeEmail,
};
