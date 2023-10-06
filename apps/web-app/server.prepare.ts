import { defineNuxtPrepareHandler } from 'nuxt-prepare/config';

export default defineNuxtPrepareHandler(async () => {
  // Do some async magic here, e.g. fetch data from an API

  // Get and store the Hanko jwks into runtime config
  const hankoUrl = process.env.WEBAPP_HANKO_API_URL;
  const hankoJwksResponse = await fetch(
    `${hankoUrl}/.well-known/jwks.json`
  ).then(function (response) {
    return response.json();
  });

  // set the primary mail domains

  const mailDomainPublicEnv = process.env.MAIL_DOMAIN_PUBLIC;
  const mailDomainPremiumEnv = process.env.MAIL_DOMAIN_PREMIUM;
  if (!mailDomainPublicEnv || !mailDomainPremiumEnv) {
    throw new Error(
      'MAIL_DOMAIN_PUBLIC or MAIL_DOMAIN_PREMIUM is not set, you must add the domains to your ENV variables'
    );
  }

  // Check for EE license, enable billing functionality

  const eeConfig = {
    enabled: false,
    modules: [] as string[]
  };

  const billingConfig = {
    enabled: false,
    billingUrl: '',
    billingKey: ''
  };

  const eeLicenseKey = process.env.EE_LICENSE_KEY;
  if (eeLicenseKey) {
    console.log('✅ Enterprise Edition is enabled');
    eeConfig.enabled = true;
  }

  const billingUrl = process.env.BILLING_URL;
  const billingKey = process.env.BILLING_KEY;
  if (eeLicenseKey && billingUrl && billingKey) {
    console.log('✅ EE Billing module is enabled');
    eeConfig.modules.push('billing');
    billingConfig.enabled = true;
    billingConfig.billingUrl = billingUrl;
    billingConfig.billingKey = billingKey;
  }
  const eeEnabled = eeLicenseKey ? true : false;

  return {
    // Overwrite the runtime config variable `foo`
    runtimeConfig: {
      hankoJwks: hankoJwksResponse,
      billing: billingConfig,
      public: {
        mailDomainPublic: JSON.parse(
          mailDomainPublicEnv
        ) as MailDomainEntries[],
        mailDomainPremium: JSON.parse(
          mailDomainPremiumEnv
        ) as MailDomainEntries[],
        eeConfig
      }
    }
  };
});

export interface MailDomainEntries {
  name: string;
  postalId: string;
}
