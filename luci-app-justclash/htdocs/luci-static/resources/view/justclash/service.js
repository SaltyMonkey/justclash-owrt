"use strict";
"require form";
"require ui";
"require view";
"require view.justclash.common as common";

return view.extend({

    render: function () {
        let m, s, o, tabname;

        m = new form.Map(common.binName);
        s = m.section(form.NamedSection, "settings");

        tabname = "serviceautomation_tab";
        s.tab(tabname, "Service automation");

        o = s.taboption(tabname, form.Flag, "forcefully_update_ntp_at_load", _("Start ntpd at load:"));
        o.description = _("If enabled, the service starts ntpd to sync system time and ensure TLS works correctly.");
        o.rmempty = false;
        o.default = "1";

        o = s.taboption(tabname, form.Flag, "update_dns_server_at_load", _("Inject DNS server at startup:"));
        o.description = _("When enabled service will inject dns server in dnsmasq configuration at start.");
        o.rmempty = false;
        o.default = "1";

        o = s.taboption(tabname, form.Flag, "update_nft_tables_at_load", _("Setup NFT tables at startup:"));
        o.description = _("When enabled, the service creates NFT tables to redirect traffic to the TPROXY port.");
        o.rmempty = false;
        o.default = "1";

        tabname = "coreautomation_tab";
        s.tab(tabname, _("Core automation"));

        o = s.taboption(tabname, form.Flag, "mihomo_autorestart", _("Mihomo autorestart:"));
        o.description = _("When enabled service will configure autorestart mihomo by cron string.");
        o.rmempty = false;
        o.default = "1";

        o = s.taboption(tabname, form.ListValue, "mihomo_update_channel", _("Mihomo autoupdate channel:"));
        common.defaultProxyUpdateChannelOptions.forEach(item => {
            o.value(item, _(`${item}`));
        });
        o.description = _("Release channel for mihomo updates.");
        o.rmempty = false;
        o.default = common.defaultProxyUpdateChannelOptions[0];

        o = s.taboption(tabname, form.ListValue, "mihomo_autoupdate", _("Mihomo autoupdate:"));
        common.defaultUpdateOptions.forEach(item => {
            o.value(item, _(`${item}`));
        });
        o.description = _("Mode for mihomo autoupdate job.");
        o.rmempty = false;
        o.default = common.defaultUpdateOptions[0];

        o = s.taboption(tabname, form.Flag, "mihomo_cron_autorestart_telegram_notify", _("Telegram notify for mihomo autorestart:"));
        o.description = _("When enabled service will send telegram notification for mihomo autorestart cron job.");
        o.rmempty = false;
        o.default = "0";

        o = s.taboption(tabname, form.Flag, "mihomo_cron_update_telegram_notify", _("Telegram notify for mihomo autoupdate:"));
        o.description = _("When enabled service will send telegram notification for mihomo autoupdate cron job.");
        o.rmempty = false;

        o = s.taboption(tabname, form.Value, "mihomo_cron_autorestart_string", _("Mihomo autorestart cron:"));
        o.placeholder = "0 3 * * 0";
        o.default = "0 3 * * 0";
        o.rmempty = false;
        o.description = _("Special cron string for mihomo autorestart job.");
        o.validate = function (section_id, value) {
            return (common.isValidCronString(value)) ? true : _("Invalid cron format. Expected: 'minute hour day month weekday' (e.g., '0 3 * * 0')");
        };

        o = s.taboption(tabname, form.Value, "mihomo_cron_update_string", _("Mihomo autoupdate cron:"));
        o.placeholder = "0 3 * * 0";
        o.default = "0 3 * * 0";
        o.rmempty = false;
        o.description = _("Special cron string for mihomo autoupdate job.");
        o.validate = function (section_id, value) {
            return (common.isValidCronString(value)) ? true : _("Invalid cron format. Expected: 'minute hour day month weekday' (e.g., '0 3 * * 0')");
        };

        tabname = "telegramcredentials_tab";
        s.tab(tabname, _("Credentials"));

        o = s.taboption(tabname, form.Value, "telegram_chat_id", _("Telegram chat ID:"));
        o.datatype = "uinteger";
        o.placeholder = "123456789";
        o.rmempty = true;
        o.description = _("Telegram chat id where to send notification.");

        o = s.taboption(tabname, form.Value, "telegram_bot_token", _("Telegram bot token:"));
        o.placeholder = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11";
        o.description = _("Telegram bot control token. WARNING! NEVER SEND IT TO ANYONE!");
        o.rmempty = true;
        o.password = true;
        o.validate = function (section_id, value) {
            return (common.isValidTelegramBotToken(value)) ? true : _("Invalid Telegram Bot Token");
        }
        let map_promise = m.render();
        return map_promise;
    },
    addCSS() {
        return E("style", {}, `

        `);
    },
    destroy() {

    }
});