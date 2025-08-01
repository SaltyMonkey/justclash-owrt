"require baseclass";

return baseclass.extend({
    binName: "justclash",
    initdPath: "/etc/init.d/justclash",
    binPath: "/usr/bin/justclash",
    binInfoPath: "/usr/bin/justclash_info",
    blockRulesetsFilePath: "/etc/blockrulesets.justclash.txt",
    rulesetsFilePath: "/etc/rulesets.justclash.txt",
    genNameProxyPrefix: "proxy",
    genNameProxyProviderPrefix: "provider",
    logsCount: "800",
    genNameProxyGroupPrefix: "proxygroup",
    defaultLoggingLevels: ["info", "warning", "error", "silent", "debug"],
    defaultProxyGroupCheckUrl: "https://www.gstatic.com/generate_204",
    defaultProxyProvidersCheckUrl: "https://www.gstatic.com/generate_204",
    defaultProxyGroupIntervalSec: 360,
    defaultProxyGroupsTypes: ["fallback", "load-balancer", "url-test"],
    defaultProxyGroupsBalanceModeStrategies: ["consistent-hashing", "round-robin"],
    defaultUrlTestTolerance: 50,
    defaultProxyProviderIntervalSec: 3600,
    defaultProxyProviderHealthCheckSec: 360,
    defaultHealthCheckTimeoutMs: 5000,
    defaultHealthCheckResult: 204,
    defaultUserAgent: "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
    defaultFingerprints: ["chrome", "firefox", "safari", "random", "edge"],
    defaultUpdateOptions: ["no", "check", "chekandupdate"],
    defaultProxyUpdateChannelOptions: ["alpha", "stable"],
    defaultTimeoutForWSReconnect: 10000,
    defaultRuleSetUpdateInterval: 86500,
    minimalRuleSetUpdateInterval: 21600,
    defaultRuleSetProxy: "DIRECT",
    generateRandomName: function (prefix) {
        return `${prefix}${Math.random().toString(16).substr(2, 8)}`;
    },
    splitAndTrimString: function (value, delimiter = ",") {

        return value.split(delimiter)
            .map(item => item.trim())
            .filter(item => item.length > 0);
    },
    valueToArray: function (value) {
        // Already an array
        if (Array.isArray(value)) {
            return value;
        }

        // String value
        if (typeof value === "string") {
            return value.length > 0 ? [value] : [];
        }

        // Number or other primitive types
        if (value !== null && value !== undefined) {
            return [value];
        }

        // Null or undefined
        return [];
    },
    isValidHttpUrl: function (value) {
        try {
            const url = new URL(value);
            return ["http:", "https:"].includes(url.protocol);
        } catch (e) {
            return false;
        }
    },
    isValidDomainProto: function (value) {
        const val = value.trim();
        if (val.startsWith("https://") ||
            val.startsWith("tls://") ||
            val.startsWith("udp://") ||
            val.startsWith("quic://")) {
            return true;
        } else {
            return false;
        }
    },
    isValidIpv4: function (value) {
        const val = value.trim();
        const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Regex.test(val);
    },
    isValidCronString: function (value) {
        const val = value.trim();
        const cronRegex = /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([012]?\d|3[01])) (\*|([0]?\d|1[0-2])) (\*|[0-6])$/;

        return cronRegex.test(val);
    },
    isValidTelegramBotToken: function (value) {
        const val = value.trim();
        if (val.length === 0) return true;
        const pattern = /^\d{6,}:[A-Za-z0-9_-]+$/;
        return pattern.test(val);
    },
    compareArraysWithReturnedResult: function (arr1, arr2) {
        return arr1.filter(value => arr2.includes(value));
    },
    isValidSimpleName: function (value) {
        const val = value.trim();
        const pattern = /^[a-z0-9_]+$/;
        return pattern.test(val);
    },
    isValidProxyLink: function (value) {
        const val = value.trim();
        const allowedPrefixes = [
            "vless://",
            "trojan://",
            "ss://",
            "socks5://"
        ];

        for (const prefix of allowedPrefixes) {
            if (val.startsWith(prefix)) {
                return true; // OK
            }
        }

        return false;
    },
    isValidDomainSuffix: function (value) {
        if (!value || value.trim().length === 0)
            return true;

        value = value.trim();

        if (/\s/.test(value))
            return _("Domain must not contain spaces");

        if (!value.includes("."))
            return _("Domain must contain at least one dot");

        if (/^[.-]/.test(value) || /[.-]$/.test(value))
            return _("Suffix must not start or end with a dot or hyphen");

        if (/\.\.|--/.test(value))
            return _("Double dots or double hyphens are not allowed");

        if (value.split(".").some(part => part.length === 0))
            return _("There must be no empty segments between dots");

        if (value.split(".").some(part => part.length > 63))
            return _("Each domain segment must not exceed 63 characters");
        if (value.length > 253)
            return _("Suffix length must not exceed 253 characters");

        return true;
    },
    isValidDomainKeyword: function (value) {
        if (!value || value.trim().length === 0)
            return true;

        value = value.trim();

        if (/\s/.test(value))
            return _("Keyword must not contain spaces");

        if (/,/.test(value))
            return _("Only one keyword per field is allowed");

        if (value.length < 2)
            return _("Keyword should be at least 2 characters long");

        return true;
    },
    isValidDomainRegexp: function (value) {
        // Allow empty value
        if (!value || value.trim().length === 0)
            return true;

        value = value.trim();

        // No spaces at start/end
        if (/^\s|\s$/.test(value))
            return _("Regexp must not start or end with a space");

        // Try to compile regexp
        try {
            new RegExp(value);
        } catch (e) {
            return _("Invalid regular expression: ") + (e.message || e);
        }

        return true;
    },
    isValidKeywordOrRegexList: function (value, ctxLabel) {
        if (!value) return true;

        const parts = value.split("|");
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            if (!part) continue;

            try {
                new RegExp(part); // поддерживается и keyword, и regexp
            } catch (e) {
                return _("Invalid expression in ") + ctxLabel + ": " + part;
            }
        }

        return true;
    }
});