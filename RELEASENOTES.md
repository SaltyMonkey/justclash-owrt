## [0.0.3] - 17072025

- LuCI: Added proxy-providers
- LuCi: Log page slight change
- LuCi: FakeIP readonly
- LuCi: Translation fix
- Service: Update stable core update
- Rule-Set: Optimize list
- Rule-Set: Do not merge in JustDomains list all parsed services

## [0.0.2] - 16072025

- LuCI: Fix connections page
- Justclash: Fix reports function
- RuleSets: Fix no-russia-hosts

## [0.0.1] - 15072025

First JustClash alpha released!
Bunch of features included as:

- Multi proxies support
- Proxy-group support
- Ready to use mrs RULE-SETs
- Easy to use config generation for Mihomo core
- Mihomo Auto update
- User Friendly UI
and etc

### Known issues

- Installer: automatically install RU language for LuCi interface
- Installer: automatically install Mihomo alpha only
- LuCi: Validation is missing for some fields in Routing tab
- LuCI: Missing proxy-providers feature
- LuCi: Main pages (first-level) can't be translated (owrt "feature")
- LuCI: Service must be restarted manually after settings change

### Caveats:

- Every router reboot FakeIP cache will be cleaned
- Every route reboot RULE-SETs will be downloaded again
- All unsaved changes will be lost when switching top level pages unless the "Save" or "Apply" button is pressed.
