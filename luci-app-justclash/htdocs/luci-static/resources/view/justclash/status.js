"use strict";
"require ui";
"require view";
"require fs";
"require view.justclash.common as common";

return view.extend({
    pollInterval: null,

    handleSave: null,
    handleSaveApply: null,
    handleReset: null,
    serviceStatusId: null,
    daemonStatusId: null,
    startButtonId: null,
    restartButtonId: null,
    stopButtonId: null,
    enableButtonId: null,
    disableButtonId: null,
    pollServiceStatusTimeout: 10000,
    isJustClashAutostartEnabled: async function () {
        const res = await fs.exec(common.initdPath, ["enabled"]);
        return res.code === 0;
    },
    isJustClashRunning: async function () {
        const res = await fs.exec(common.initdPath, ["running"]);
        return res.code === 0;
    },
    boolToWord(boolValue) {
        return boolValue ? _("Yes") : _("No");
    },
    boolToColor(boolValue) {
        return boolValue ? "green" : "red";
    },
    async load() {
        const [
            infoDevice,
            infoOpenWrt,
            infoPackage,
            infoLuciPackage,
            infoCore,
            cronCore,
            cronCoreAutorestart
        ] = await Promise.all(
            [
                fs.exec(common.binInfoPath, ["info_device"]).catch(() => _("No data")),
                fs.exec(common.binInfoPath, ["info_openwrt"]).catch(() => _("No data")),
                fs.exec(common.binInfoPath, ["info_package"]).catch(() => _("No data")),
                fs.exec(common.binInfoPath, ["info_luci"]).catch(() => _("No data")),
                fs.exec(common.binInfoPath, ["info_core"]).catch(() => _("No data")),
                fs.exec(common.binPath, ["core_update_cron_check"]).catch(() => _("No data")),
                fs.exec(common.binPath, ["core_autorestart_cron_check"]).catch(() => _("No data")),
            ]);
        const [
            infoIsRunning,
            infoIsAutostarting
        ] = await Promise.all(
            [
                this.isJustClashRunning().catch((e) => { console.log(e); return _("No data"); }),
                this.isJustClashAutostartEnabled().catch((e) => { console.log(e); return _("No data"); })
            ]);
        return {
            infoDevice,
            infoOpenWrt,
            infoPackage,
            infoLuciPackage,
            infoCore,
            infoIsRunning,
            infoIsAutostarting,
            cronCore,
            cronCoreAutorestart
        };
    },
    async render(results) {
        console.warn(results);

        const statusContainer = E("div", { class: "cbi-section fade-in" }, [
            E("h3", { class: "cbi-section-title" }, _("Service status:")),
        ]);

        const tableContainer = E("table", { class: "table cbi-rowstyle-1" }, [
            E("tr", { class: "tr" }, [
                E("td", { class: "td left" }, _("Device model:")),
                E("td", { class: "td left" }, results.infoDevice.stdout.replace("\\n", "").trim())
            ]),
            E("tr", { class: "tr cbi-rowstyle-2" }, [
                E("td", { class: "td left" }, _("System version:")),
                E("td", { class: "td left" }, results.infoOpenWrt.stdout.replace("\\n", "").trim())
            ]),
            E("tr", { class: "tr" }, [
                E("td", { class: "td left" }, _("Service package version:")),
                E("td", { class: "td left" }, results.infoPackage.stdout.replace("\\n", "").trim())
            ]),
            E("tr", { class: "tr cbi-rowstyle-2" }, [
                E("td", { class: "td left" }, _("Luci package version:")),
                E("td", { class: "td left" }, results.infoLuciPackage.stdout.replace("\\n", "").trim())
            ]),
            E("tr", { class: "tr cbi-rowstyle-1" }, [
                E("td", { class: "td left" }, _("Mihomo core version:")),
                E("td", { class: "td left" }, results.infoCore.stdout.replace("\\n", "").trim())
            ]),
            E("tr", { class: "tr cbi-rowstyle-2" }, [
                E("td", { class: "td left" }, _("Service is running:")),
                E("td", { class: "td left", id: "isrunning", style: `color: ${this.boolToColor(results.infoIsRunning)}` }, this.boolToWord(results.infoIsRunning))
            ]),
            E("tr", { class: "tr cbi-rowstyle-1" }, [
                E("td", { class: "td left" }, _("Service's autostart:")),
                E("td", { class: "td left", id: "isautostarting", style: `color: ${this.boolToColor(results.infoIsAutostarting)}` }, this.boolToWord(results.infoIsAutostarting))
            ])
        ]);

        statusContainer.appendChild(tableContainer);

        const actionContainer = E("div", { class: "cbi-page-actions jc-actions" });
        const actionContainerSecondary = E("div", { class: "cbi-page-actions jc-actions" });

        const createButton = (action, cssClass, label) => {
            return E("button", {
                class: `cbi-button ${cssClass}`,
                id: `button${action}`,
                click: ui.createHandlerFn(this, async function () {
                    const buttons = actionContainer.querySelectorAll("button");
                    const buttonsSecondary = actionContainerSecondary.querySelectorAll("button");
                    buttons.forEach(btn => btn.disabled = true);
                    buttonsSecondary.forEach(btn => btn.disabled = true);
                    ui.showModal(_("Executing command..."), [E("p", _("Please wait."))]);

                    try {
                        await fs.exec(common.initdPath, [action]);
                        await this.updateServiceStatus();
                    } catch (e) {
                        ui.addNotification(_("Error"), e.message, "danger");
                    } finally {
                        ui.hideModal();
                        buttons.forEach(btn => btn.disabled = false);
                        buttonsSecondary.forEach(btn => btn.disabled = false);
                    }
                })
            }, [
                label
            ]);
        };

        actionContainer.appendChild(createButton("start", "cbi-button-positive", _("Start")));
        actionContainer.appendChild(createButton("stop", "cbi-button-negative", _("Stop")));

        actionContainerSecondary.appendChild(createButton("enable", "cbi-button-positive", _("Enable autostart")));
        actionContainerSecondary.appendChild(createButton("disable", "cbi-button-negative", _("Disable autostart")));

        this.startPolling();

        return E("div", { class: "cbi-map" }, [
            this.addCSS(),
            E("div", { class: "cbi-section" }, [
                statusContainer,
                actionContainer,
                actionContainerSecondary
            ])
        ]);
    },
    updateUI(isRunning, isAutostarting) {
        if (this.daemonStatusId) {
            this.daemonStatusId.textContent = this.boolToWord(isAutostarting);
            this.daemonStatusId.style.color = this.boolToColor(isAutostarting);
        }
        if (this.serviceStatusId) {
            this.serviceStatusId.textContent = this.boolToWord(isRunning);
            this.serviceStatusId.style.color = this.boolToColor(isRunning);

        }
    },
    updateButtons(isRunning, isAutostarting) {
        if (this.startButtonId) {
            this.startButtonId.disabled = isRunning;
        }
        if (this.stopButtonId) {
            this.stopButtonId.disabled = !isRunning;
        }

        if (this.enableButtonId) {
            this.enableButtonId.disabled = isAutostarting;
        }
        if (this.disableButtonId) {
            this.disableButtonId.disabled = !isAutostarting;
        }
    },
    async updateServiceStatus() {
        const [infoIsRunning, infoIsAutostarting] = await Promise.all([
            this.isJustClashRunning().catch(() => _("No data")),
            this.isJustClashAutostartEnabled().catch(() => _("No data"))
        ]);

        this.startButtonId = document.getElementById("buttonstart");
        this.stopButtonId = document.getElementById("buttonstop");

        this.enableButtonId = document.getElementById("buttonenable");
        this.disableButtonId = document.getElementById("buttondisable");

        this.serviceStatusId = document.getElementById("isrunning");
        this.daemonStatusId = document.getElementById("isautostarting");

        this.updateUI(infoIsRunning, infoIsAutostarting);
        this.updateButtons(infoIsRunning, infoIsAutostarting);
    },

    startPolling() {
        if (this.pollInterval) clearInterval(this.pollInterval);

        this.pollInterval = setInterval(() => {
            this.updateServiceStatus();
        }, this.pollServiceStatusTimeout);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
            } else {
                this.startPolling();
            }
        });
    },

    addCSS() {
        return E("style", {}, `
            .cbi-button { margin-right: 0.5em; }
            .jc-actions {
                text-align: left !important;
                border-top: 0px !important;
            }
        `);
    },

    destroy() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
});