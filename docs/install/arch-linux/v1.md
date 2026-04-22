# System Changelog

This is the record of my Arch linux second installation, desktop stack &
modification

**Convention :**

- **Types** : fix | patch | feat | chore | refactor | rollback
- **Categories** : service | daemon | kernel | apps | gui | shell | filesystem |
  opt-apps | misc

**Version Managements :**

Syntax `${num1}.{num2}.{num3}`, where :

- num1 is for breaking changes or massive update
- num2 is for medium & small changes
- num3 is for small & medium fixes

---

## 1.13.0 - Feat[shell] XDG Portal Extends

### Summary

xdg seems to describe the current state of the desktop env for the apps,
eg `$XDg_CONFIG_HOME` whom specify which dir is home dir

### Commands

```fish
sudo pacman -S xdg-desktop-portal xdg-utils yazi
yay -S xdg-desktop-portal-termfilechooser-git
```

## 1.12.0 - Feat[shell/service] OS Keyring

### Summary

Added an os keyring in order to store secrets

### Commands

```fish
sudo pacman -S gnome-keyring libsecret \ # required
                seahorse                 # gui-manager
```

## 1.11.0 - Feat[apps] Web to App (Nativefier)

### Summary

Installed nativefier for standalone web app

### Commands

```fish
pnpm add -g nativefier
sudo pacman -S dex # app autostart management
```

> [!NOTE]
> Installed **whatsapp-web** living at `/opt/my-nativefier-apps/whatsapp-web/`,
> Icon can be found at `/usr/share/pixmaps/` and `.desktop` at
> `/usr/share/applications/`
>
> Modified`hyprland.conf` to exec-once `dex -ad`

## 1.10.0 - Feat[shell/misc] Text to speech setup

### Summary

Speech to text sound support, bare minimum with `espeak-ng`,

note undescribly awfull remember to change for piper

### Commands

```fish
sudo pacman -D speech-dispatcher # speech dispatcher daemon
spd-conf -uc # generate a basic config with for user

sudo pacman -D espeakup # output comes with espeak-ng
sudo systemctl enable --now espeakup # reboot if necessary
```

## 1.9.0 - Feat[shell/misc] Extened Gaming Setup

### Summary

thourgh introduction of `ge-proton` and `gamescope` run games with better perf
using upscaling

### Commands

```fish
sudo pacman -S gamescope
sudo pacman -S mangohud lib32-mangohud
sudo pacman -S libxcursor libxres vlc
```

## 1.8.0 - Feat[shell/misc]: Gaming Setup

### Summary

General purpose gaming setup for linux & windows based apps

### Commands

```fish
sudo pacman -S wine lutris
sudo pacman -S winetricks zenity unrar
```

**Packages Descriptions:**

- **wine** windows compatibility layer
- **lutrus** general purpose game launcher
- **winetricks** wine's windows spec lib/implementation manager

### Note

**installed winetricks packages:**

- cmd
- dirac
- dotnet40
- dxvk
- vcrun2008
- vcrun2015
- vcrun2022
- vcrun6
- vkd3d
- xna40
- xvid
- xaudio_29
- dotnet48

> All microsoft/adobe/ubuntu fonts

## 1.7.0 - Feat[shell]: Added screen brightness control

### Commands

```fish
sudo pacman -S brightnessctl
```

---

## 1.6.1 — Fix[filesystem]: Btrfs Incoherent Disk Usage

### Summary

The problem arise from a my fundamental misunderstanding of how Btrfs's
**Copy-on-Write (CoW)** mechanism interacts with long-lived **snapshots**.

In Btrfs, when a file is modified, the filesystem does not overwrite the
existing data. Instead, it writes the new data to a different location and
updates the file's metadata to point to the new data blocks. The original data
blocks remain unchanged. This is the **Copy-on-Write** behavior.

This is a very efficient process, but it has a key side effect: if a snapshot
exists, it maintains a reference to the original, unmodified data blocks. As the
system continues to change, these "stale" data blocks accumulate, even if the
files they belong to have been deleted or modified. Btrfs cannot free this space
because the snapshots still reference the data, preventing the filesystem from
reclaiming it.

Over time, this accumulation of referenced but "unseen" data blocks can lead to
a significant discrepancy between the actual disk usage and what is reported by
commands like `du`, which only accounts for the currently active filesystem. The
issue was exacerbated by my use of Snapper, which created snapshots on a regular
basis, thereby maintaining these references and causing the disk space usage to
snowball.

**Note on Defragmentation**: Attempting to defragment the Btrfs filesystem with
`btrfs filesystem defragment` can actually worsen this problem. Defragmentation
also uses CoW, creating new, contiguous data blocks and leaving the old,
fragmented blocks behind. If a snapshot references the original, fragmented
blocks, they will not be freed, resulting in a net increase in disk usage.

### Fix

The solution is to delete the old snapshots. By removing a snapshot, you break
the references to the stale data blocks it holds, allowing Btrfs to reclaim the
space. To prevent the problem from reoccurring, I've configured Snapper to keep
a strict minimum of snapshots and to automatically clean up older ones.

---

## 1.6.0 — Feat[apps/shell]: Linux Full Sub system for Windows

### Summary

Through `winapps`, run windows only applications on linux

**Source Documentation "[on github](https://github.com/winapps-org/winapps)"**

### Commands

```fish
sudo pacman -Syu --needed -y curl dialog freerdp git iproute2 libnotify openbsd-netcat
# this command will remove gnu-netcat required by zed

sudo pacman -Syu --needed yad
yay -S ironbar-git
```

### Notes

- **misc:**
  - installed ironbar

- **currently installed apps:**
  - cmd
  - powershell
  - full office suite
  - illustrator
  - winrar
  - power iso

### !ToFix

- exposed `/home/my_username` dir to windows
- no usb access in full windows mode
- windows kernel hardening required

---

## 1.5.0 — Fix[service/daemon]: Docker & Docker desktop conflict over socket 🐳

### Summary

Due to `docker` & `docker-desktop` reimplementing there own `docker.sok`,
commands eg `docker compose` failed due to mismatched files ownership as it was
trying to use `docker-desktop`'s socket version

### Commands

```fish
sudo usermod -aG kvm $USER
sudo usermod -aG docker $USER
docker context use default
```

---

## 1.4.1 — Patch[service/daemon]: Docker Security Patch 🐳

### Summary

#### **1. Installing Core Security Packages**

```bash
sudo pacman -S iptables-nft apparmor
```

- **`iptables-nft`**: Installs the modern `iptables` backend, `nftables`, for
  advanced network filtering and firewall management. This is the default for
  recent Linux distributions.
- **`apparmor`**: Installs the AppArmor Mandatory Access Control (MAC) system,
  which restricts what programs can do by enforcing security profiles.

#### **2. Configuring and Enabling AppArmor**

```bash
systemctl enable --now apparmor
```

This command enables and starts the AppArmor system service immediately. This
allows AppArmor to load and enforce security profiles for applications,
including Docker containers.

#### **3. Cleaning Up and Installing Docker**

```bash
# Removing the old Docker binary if it exists
rm /usr/local/bin/docker

# Installing the official Arch Linux Docker package
sudo pacman -S docker
sudo systemctl enable docker
```

- **`rm /usr/local/bin/docker`**: A precautionary step to remove a potentially
  outdated or manually installed Docker binary, ensuring the official Arch
  package is used.
- **`sudo pacman -S docker`**: Installs the Docker daemon and client from the
  official Arch repositories.
- **`sudo systemctl enable docker`**: Configures the Docker daemon to start
  automatically on system boot.

#### **4. Configuring Kernel Security Modules via GRUB**

The following lines were added to the `/etc/default/grub` file.

```bash
GRUB_CMDLINE_LINUX_DEFAULT="loglevel=3 quiet lsm=landlock,lockdown,yama,integrity,apparmor,bpf"
GRUB_GFXMODE="1024x768,800x600,auto"
```

- **`lsm=...`**: This option enables a chain of Linux Security Modules (LSMs) at
  boot time, which significantly hardens the kernel.
  - **`landlock`**: Allows unprivileged processes to create sandboxes.
  - **`lockdown`**: Prevents even the root user from compromising kernel
    security.
  - **`yama`**: Restricts the `ptrace` system call, preventing process snooping.
  - **`integrity`**: Enables the Integrity Measurement Architecture (IMA) to
    verify file integrity.
  - **`apparmor`**: Explicitly loads the AppArmor LSM.
  - **`bpf`**: Enables the BPF LSM, providing enhanced security for BPF
    programs.

#### **5. Applying GRUB Changes**

```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

This command regenerates the GRUB boot configuration file, applying the changes
made to `GRUB_CMDLINE_LINUX_DEFAULT`. The system must be rebooted for these
kernel LSMs to take effect.

---

## 1.4.0 — Feat[shell/apps]: Added Docker Integration for Service Daemon 🐳

### Summary

This entry introduces **Docker** integration, allowing the service daemon to run
in a containerized environment.

#### **Installation and Setup**

##### **1. Install Docker Engine**

```fish
# Download and extract the static Docker binary
wget https://download.docker.com/linux/static/stable/x86_64/docker-28.4.0.tgz -qO- | tar xvfz - docker/docker --strip-components=1

# Move the binary to a system-wide path
sudo mv ./docker /usr/local/bin
```

##### **2. Install Docker Desktop**

```fish
# Install the Docker Desktop package using pacman
sudo pacman -U ./docker-desktop-x86_64.pkg.tar.zst
# Note: By default, Docker Desktop is installed at /opt/docker-desktop.
```

##### **3. Configure `kvm`**

Ensure the `kvm` module is enabled and your user is part of the `kvm` group for
proper virtualization support.

```fish
# Check if the kvm module is loaded
lsmod | grep kvm

# Add your user to the kvm group
sudo usermod -aG kvm $USER
```

### **Notes**

- **`pass` and GPG:** You'll need to generate a GPG key and initialize `pass`
  for secure credential management, which is often used in a containerized
  workflow.

```fish
gpg --generate-key
pass init <gpg_key_id>
```

- **Login to Docker Desktop:** After installation, launch Docker Desktop and log
  in to begin using the service.

---

## 1.3.0 — Feat[service/daemon]: Added Notification daemon**

### Commands

```fish
sudo pacman -S dunst fortune-mod 

# test
notify-send "$(fortune)"
```

---

## 1.2.0 — Feat[service/daemon]: Added Bluetooth support

### Summary

**Package Descriptions:**

- **bluez**: Daemons for the bluetooth protocol stack
- **bluez-utils**: Development and debugging utilities for the bluetooth
  protocol stack
- **bluetui**: A TUI for managing Bluetooth devices.

### Commands

```fish
sudo pacman -S bluez bluez-utils bluetui
systemctl enable --now bluetooth
```

### Tips

- use `lsmod` to show loaded kernel module
  - Eg: `lsmod | grep btusb` where btusb is the bluetooth kernel module
- use `modinfo <module-name>` to show info about a specific module

### Fixed

- Discord now launch
  - reason: desktop & usr/bin referenced `/opt/Discord/Discord/Discord` expect
    the real/up to date version live at `~/Discord/Discord`

---

## 1.1.0 — Feat[shell]: Ollama Setup

### Summary

**Package Descriptions:**

- ollama: The Ollama AI model server, which allows you to run large language
  models on your local machine.

### Commands

```fish
sudo pacman -S ollama
ollama pull qwen3:8b
ollama pull qwen3:4b
```

---

## 1.0.0 — Feat[kernel]: Intel Graphics Setup

## Summary

This changelog entry documents the installation and configuration of the core
graphics stack, including drivers for OpenGL, Vulkan, and hardware video
acceleration. This setup is optimized for a modern Intel GPU on a Wayland-based
system.

**Changes:**

- Edited `/etc/pacman.conf` to activate the multilib repository to allow for the
  installation of 32-bit packages, which are required for compatibility with
  many applications, including games.

**Package Descriptions:**

- **mesa**: The foundational open-source graphics library. It provides the DRI
  (Direct Rendering Infrastructure) driver for 3D acceleration and includes
  modern drivers like iris and crocus. This package is the cornerstone of the
  graphics stack.
- **vulkan-intel**: The official open-source driver that enables support for the
  Vulkan graphics and compute API on Intel GPUs from the Broadwell generation
  (Gen8) and newer.
- **lib32-mesa**: Provides the 32-bit versions of the Mesa libraries, which are
  essential for running 32-bit applications and games in a 64-bit environment.
- **lib32-vulkan-intel**: Provides the 32-bit Vulkan drivers, ensuring 32-bit
  applications can utilize the Vulkan API.
- **libva-utils**: A utility package that provides the vainfo command, a
  critical tool for verifying that hardware video acceleration is correctly
  configured and working.
- **vulkan-tools**: A collection of tools for the Vulkan ecosystem, including
  the vulkaninfo command, which is used to check that the Vulkan API is
  functioning on your hardware.
- **mesa-utils**: A set of essential utilities for Mesa, which includes the
  glxinfo command. glxinfo is the standard tool for checking your OpenGL version
  and verifying that the OpenGL driver is properly loaded.
- **intel-media-driver**: The recommended VA-API driver for hardware-accelerated
  video decoding and encoding on Intel GPUs from Broadwell and newer, including
  the latest Intel Arc GPUs. This offloads video processing from the CPU to the
  GPU.

### Commands

```fish
sudo pacman -S mesa vulkan-intel lib32-mesa lib32-vulkan-intel libva-utils vulkan-tools mesa-utils intel-media-driver
```

### Fixed

- Zeditor now respond/appear when launched

---

## 0.10.0 — Feat[kernel]: Intel Microcode and GRUB Theme Update

### Summary

**Changes:**

- Installed Intel CPU microcode updates and ensured early loading via GRUB.
- Installed `mkinitcpio` to regenerate initramfs.
- Applied custom GRUB theme
  ([HyperFluent](https://github.com/Coopydood/HyperFluent-GRUB-Theme)):

  - Extracted the Arch-specific theme to:
    `/usr/share/grub/themes/fluent/theme.txt`
  - Set the theme in `/etc/default/grub`:

    ```ini
    GRUB_THEME="/usr/share/grub/themes/fluent/theme.txt"
    ```

### Commands

```fish
sudo pacman -S intel-ucode mkinitcpio
mkinitcpio -P
grub-mkconfig -o /boot/grub/grub.cfg
```

---

## 0.9.0 — Feat[apps]: added keepassxc for password management

### Commands

```fish
sudo pacman -S keepassxc
```

---

## 0.8.0 — Feat[apps]: added megasync & megasync thunar bindings

### Commands

```fish
wget https://mega.nz/linux/repo/Arch_Extra/x86_64/megasync-x86_64.pkg.tar.zst && sudo pacman -U "$PWD/megasync-x86_64.pkg.tar.zst"
```

### Note

Added Dependency : `xorg-xrdb`

Thunar Megasync Binding lib extracted from `thunar-megasync-x86_64.pkg.tar.zst`
and added at `/usr/lib/thunarx-3`

---

## 0.7.0 — Feat[service/daemon]: added ntfs-3g for ntfs read/write/fix support

### Summary

The ntfs3 kernel driver provides read and write support for the file system.

### Commands

```fish
sudo pacman -S ntfs-3g wget
```

### Note

There are no userspace utilities alongside the kernel driver. To format
partitions or perform maintenance you still need a Windows machine or external
tools like NTFS-3G. But minimal maintenance is still possible through `ntfsfix`.

> Misc: added `wget`

---

## 0.6.0 — Feat[service/daemon]: added udisks2 for removable devices management

### Summary

udisks provides a daemon udisksd, that implements D-Bus interfaces used to query
and manipulate storage devices, and a command-line tool udisksctl, used to query
and use the daemon.

### Commands

```fish
sudo pacman -S  udisks2
sudo systemctl enable --now udisks2
```

---

## 0.5.0 — Feat[opt-apps]: added discord & thunderbird

### Summary

Added discord & thunderbird at :

- `/opt/mozilla/thunderbird`
- `/opt/Discord/Discord`

### Note

- added through sm linking `thunderbird-bin`
- added wofi & hyprpicker as miscellaneous
- re-optimized Btrfs partition :

```fish
sudo btrfs filesystem defragment -r -v -czstd /docker/
sudo btrfs filesystem defragment -r -v -czstd /home
sudo btrfs filesystem defragment -r -v -czstd /
```

---

## 0.4.1@stable — Fix[service/daemon]: pipewire audio management

### Summary

Due to incompatible audio `Built-In` profiles, any application/process client of
pipewire was redirected to a dummy audio sinks instead of the physical audio
sinks

> Fix: `pavucontrol` and set `built in profile` to
> `Analog Surround 4.0 Output + Analog Stereo Input`

---

## 0.4.0@unstable — Feat[service/daemon]: Added pipewire for audio management

### Summary

- Installed and configured PipeWire stack:
  - Installed: pipewire, pipewire-pulse, wireplumber
  - Enabled user services: pipewire.service, pipewire-pulse.service,
    wireplumber.service
  - Created ~/.asoundrc to route ALSA → PulseAudio
  - Set PULSE_SERVER manually for Firefox to use Pulse backend
  - Verified with pactl and about:support (firefox url)

### Commands

```fish
sudo pacman -S  pipewire pipewire-pulse wireplumber rtkit
sudo systemctl enable --now pipewire
sudo systemctl enable --now pipewire-pulse
sudo systemctl enable --now wireplumber
```

### Note

Installed and configured `rtkit` daemon, rtkit stands for Real-Time Policy and
Watchdog Daemon.

It is a small D-Bus system service that safely grants real-time scheduling
privileges to user processes (like PipeWire or JACK), without giving them full
root privileges. required by wireplumber

### **!ToFix**

- Firefox stuck on `alsa` as audio backend instead of pulse (pipewire-pulse)

---

## 0.3.1 — Fix[filesystem]: Fixed mount error for `/.snapshots` dir

### Summary

Due to overlapping sub volume reference in `fstab` for `/home/.snapshots`'s
subvolume referencing the root's `/.snapshots` instead of his

Fix:

- Before:

```ini
UUID=9b1362d6-af80-4a51-9dce-f6f6fb606fc2 /home/.snapshots btrfs rw,relatime,compress=zstd:3,ssd,discard=async,space_cache=v2,subvol=/.snapshots 0 0
```

- After

```ini
UUID=9b1362d6-af80-4a51-9dce-f6f6fb606fc2 /home/.snapshots btrfs rw,relatime,compress=zstd:3,ssd,discard=async,space_cache=v2,subvol=/home/.snapshots 0 0
```

---

## 0.3.0 — Feat[filesystem]: Added Btrfs snapshot boot via grub-btrfs

### Packages

- `grub-btrfs` auto detect snapper snapshot

### Commands

```fish
sudo pacman -S grub-btrfs #
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

---

## 0.2.0 — Feat[filesystem]: Added Snapper system + home snapshot management

### Snapper Setup

```fish
sudo snapper -c root create-config /
sudo snapper -c home create-config /home

# Create .snapshots subvolumes manually (required for Snapper)
sudo btrfs subvolume create /.snapshots
sudo btrfs subvolume create /home/.snapshots

# Fix ownership and permissions
sudo chown -R :users /.snapshots /home/.snapshots
sudo chmod 750 /.snapshots /home/.snapshots

# Enable auto-snapshotting and cleanup
sudo systemctl enable --now snapper-timeline.timer
sudo systemctl enable --now snapper-cleanup.timer
```

### Initial Test Snapshots

```fish
sudo snapper -c root create --description "v0.2.0@stable"
sudo snapper -c home create --description "home baseline"
```

### fstab Updates

#### Root snapshots

```ini
UUID=a607911d-df25-483f-9a29-c17e65578ec9 /.snapshots btrfs rw,relatime,compress=zstd:3,ssd,discard=async,space_cache=v2,subvol=.snapshots 0 0
```

#### Home snapshots

```ini
UUID=9b1362d6-af80-4a51-9dce-f6f6fb606fc2 /home/.snapshots btrfs rw,relatime,compress=zstd:3,ssd,discard=async,space_cache=v2,subvol=.snapshots 0 0
```

> NOTE: Old `@snapshots` subvol was removed and replaced with `.snapshots` via
> Snapper.

---

## 0.1.1 — Fix[filesystem]: ensure full compression across mounted dirs

### Summary

Previously, files under `/mnt`, `/mnt/home`, etc. escaped compression; Fixed by
defragmenting with compression enabled; **Current compression ratio:** 40–70%;

### Commands

```fish
sudo btrfs filesystem defragment -r -v -czstd /docker/
sudo btrfs filesystem defragment -r -v -czstd /home
sudo btrfs filesystem defragment -r -v -czstd /
```

---

## 0.1.0 | Feat[shell/gui/misc]: Added fish shell environment & JS package managers

### Summary

Installed Multiple pkg manager for `fish` and `javascript`; Side note added
`quickshell`

### Packages

- `yay` (with `unzip`)
- `fisher` (Fish plugin manager)
- `pnpm`, `deno`, `bun`
- `nvm.fish`(via Fisher), `node`, `npm`
- `quickshell` (via AUR)

---

## 0.0.1 — Fix[misc]: Fixed Locale error with `"C"` (missing UTF-8)

### Summary

Fixed minor error with system fonts

### Tech Spec

#### Setup Commands

```fish
sudo localedef -i en_US -f UTF-8 en_US.UTF-8

# Add to ~/.config/fish/config.fish:
set -x LANG en_US.UTF-8
set -x LC_ALL en_US.UTF-8
```

---

## 0.0.0 — Feat[service/gui/filesystem]: System Core

### Summary

Post installed Arch linux, bare bone but with network support; **System
Information :**

- **Distribution**: Arch Linux
- **Architecture**: x86_64
- **Filesystem**: Btrfs with zstd:3 compression
- **Desktop**: Hyprland (Wayland)
- **Shell**: Fish
- **Editor**: Zed, VS Code, Neovim
- **ZRAM**: 9.9GB
- **SWAP**: 7.8GB

### Commands

```fish
# wm & network
sudo pacman -S iw hyprland 

# dev compiler/interpreter
sudo pacman -S nodejs rust cargo gcc

# shell & terminal 
sudo pacman -S kitty fish

# text editor
sudo pacman -S code zed nano nvim vi

# fonts
sudo pacman -S ttf-dejavu ttf-liberation noto-fonts noto-fonts-cjk noto-fonts-emoji ttf-jetbrains-mono nerd-fonts
```

### Notes

- All partitions except `nvme0n1p1` (boot) use `btrfs` with `zstd:3`
- DNS manually set to `1.1.1.1` via `resolv.conf`
- **Btrfs subvol layout:**

| path        | subvolume   |
| ----------- | ----------- |
| /           | /@          |
| /var/log    | /@log       |
| /.snapshots | /@snapshots |

### **!ToFix**

- Zed editor does not start (unknown issue)
