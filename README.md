# JustClash

> **Warning: This is a demo/educational project!**
> The repository demonstrates how to work with external binary files, as well as basic Linux scripting, network configuration, and routing integration in OpenWrt and FriendlyWrt. It is not intended for production use.

## Overview

**JustClash** is a simple service package for OpenWrt and FriendlyWrt that manages the Mihomo/Clash core in TPROXY mode. The project showcases how to wrap, configure, and control external proxy binaries, automate Linux service management, and interact with network and routing components in a router environment.

## Features

- Launches and supervises the Mihomo/Clash core as a system service.
- Integration of external binaries with Linux shell scripting.
- Practical examples of network and routing configuration (TPROXY, firewall, policy routing).
- Integrates with OpenWrt/FriendlyWrt service management.
- All configuration is handled via UCI (`/etc/config/justclash`).
- LuCI web interface for controlling and monitoring the service.
- Diagnostic tools for DNS, ICMP, and routing checks.
- Safe config reset, backup, and restore patterns.

## Project Structure

- `justclash/` — Main service scripts, init.d, config templates, helpers.
- `luci-app-justclash/` — LuCI web interface for controlling and monitoring the service.
- `Makefile` — OpenWrt-compatible package build scripts.
- Files for build systems, Docker, syntax checkers, git and related automation.

## Requirements

### justclash (from justclash/Makefile)
- `nftables`
- `curl`
- `kmod-nft-tproxy`

### luci-app-justclash (from luci-app-justclash/Makefile)
- `luci-base`
- `justclash`

- **Firmware:**
  - Requires OpenWrt 24+.
  - FriendlyWrt 20240115+ (untested).
  - LuCI (web interface) and the above dependencies should be available.

## Installation

### 1. One-Line Install Script

You can install JustClash with a single command using the provided install script:

```
sh <(wget -O - https://raw.githubusercontent.com/saltymonkey/justclash-owrt/refs/heads/main/install.sh)
```

This method will automatically download and execute the installation script, handling the setup for you.

### 2. Download Prebuilt Packages from Releases

Prebuilt packages are available in the [Releases](https://github.com/SaltyMonkey/justclash-owrt/releases) section of the repository. To install:

1. Download the latest `justclash` and `luci-app-justclash` packages for your architecture from the Releases page.
2. Transfer the packages to your router.
3. **Install them using:**

   - **For OpenWrt (ipk packages):**
     ```
     opkg install justclash_*.ipk luci-app-justclash_*.ipk
     ```

   - **For OpenWrt snapshot or Alpine-based systems using apk (if your firmware uses Alpine package manager):**

Choose the command appropriate for your system:
- Use `opkg` for standard OpenWrt releases.
- Use `apk` if you are on a snapshot or a system with Alpine package manager support.

### 3. Build from Source (using Docker)

You can build the JustClash packages using the provided Dockerfiles:

- For stable OpenWrt (ipk packages):

    ```
    docker build -t justclash-builder-stable -f Dockerfile-stable .
    ```

- For OpenWrt snapshot (apk packages):

    ```
    docker build -t justclash-builder-snapshot -f Dockerfile-snapshot .
    ```

After the build, extract the resulting packages from the container and install as above.

## Usage

1. Configure via LuCI: **Services → JustClash**.
2. Or edit `/etc/config/justclash` directly (YAML editing is not supported).
3. Start/stop the service:
    ```
    /etc/init.d/justclash start
    /etc/init.d/justclash stop
    ```
4. Use diagnostic commands for DNS, ICMP, and routing tests.

## Limitations

- **TUN mode is not supported.** Only TPROXY mode is available.
- This is a demonstration of service integration, not a full-featured proxy solution.
- Use at your own risk; no production support.

## License

GPL-2.0

---

**This project is for educational and demonstration purposes only.**

**Issues and feature requests are accepted via GitHub Issues.**