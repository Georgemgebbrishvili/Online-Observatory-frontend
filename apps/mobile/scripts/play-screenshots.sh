#!/bin/sh
# Google Play phone screenshots: Tonight, Collection, Club and the live room, in English
# and Georgian, from a running Android emulator with the release build installed and
# signed in. Run from apps/mobile:
#
#   sh scripts/play-screenshots.sh <missionId>
#
# <missionId> is a confirmed booking's mission (Account tab -> a confirmed night) so the
# live room has something to show. The emulator must be a Google APIs image (not Google
# Play), so `adb root` can switch the system language. Output: store/screenshots/<lang>/.
set -eu

MISSION="${1:?usage: sh scripts/play-screenshots.sh <missionId>}"
PACKAGE="ge.astroman.stellar"
ADB="${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb"

"$ADB" wait-for-device
"$ADB" root >/dev/null
"$ADB" wait-for-device

shoot() { # <lang> <name> <deep link path>
  "$ADB" shell am start -W -a android.intent.action.VIEW -d "stellar://$3" "$PACKAGE" >/dev/null
  sleep 6 # the screen reads the platform; give it time to settle
  "$ADB" exec-out screencap -p > "store/screenshots/$1/$2.png"
  echo "store/screenshots/$1/$2.png"
}

for lang in en ka; do
  mkdir -p "store/screenshots/$lang"
  locale=$([ "$lang" = ka ] && echo ka-GE || echo en-GB)
  # The app follows the system language (src/i18n/locale.tsx).
  "$ADB" shell "setprop persist.sys.locale $locale; stop; start"
  "$ADB" wait-for-device
  until [ "$("$ADB" shell getprop sys.boot_completed | tr -d '\r')" = 1 ]; do sleep 2; done
  "$ADB" shell am force-stop "$PACKAGE"
  # The demo clock in the status bar, so every capture reads the same.
  "$ADB" shell settings put global sysui_demo_allowed 1
  "$ADB" shell am broadcast -a com.android.systemui.demo -e command enter >/dev/null
  "$ADB" shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 2130 >/dev/null
  shoot "$lang" 1-tonight "/"
  shoot "$lang" 2-collection "/collection"
  shoot "$lang" 3-club "/club"
  shoot "$lang" 4-live-room "/missions/$MISSION"
  "$ADB" shell am broadcast -a com.android.systemui.demo -e command exit >/dev/null
done
