import { describe, expect, it } from "vitest";
import { parseMounts } from "@/lib/devtools/collect";
import { collectIntervalMs, isSelfCollectEnabled } from "@/lib/devtools/self-collect";

describe("isSelfCollectEnabled()", () => {
  it("is on by default for a self-hosted production server", () => {
    expect(isSelfCollectEnabled({ NODE_ENV: "production" })).toBe(true);
  });

  it("is off by default on Vercel and in dev", () => {
    expect(isSelfCollectEnabled({ NODE_ENV: "production", VERCEL: "1" })).toBe(false);
    expect(isSelfCollectEnabled({ NODE_ENV: "development" })).toBe(false);
  });

  it("honours an explicit DEVTOOLS_SELF_COLLECT override", () => {
    expect(isSelfCollectEnabled({ NODE_ENV: "development", DEVTOOLS_SELF_COLLECT: "true" })).toBe(
      true,
    );
    expect(isSelfCollectEnabled({ NODE_ENV: "production", DEVTOOLS_SELF_COLLECT: "0" })).toBe(
      false,
    );
  });

  it("never runs during next build", () => {
    expect(
      isSelfCollectEnabled({
        NODE_ENV: "production",
        NEXT_PHASE: "phase-production-build",
        DEVTOOLS_SELF_COLLECT: "true",
      }),
    ).toBe(false);
  });
});

describe("collectIntervalMs()", () => {
  it("defaults to 60s and clamps to a 15s minimum", () => {
    expect(collectIntervalMs({})).toBe(60_000);
    expect(collectIntervalMs({ DEVTOOLS_COLLECT_INTERVAL_S: "abc" })).toBe(60_000);
    expect(collectIntervalMs({ DEVTOOLS_COLLECT_INTERVAL_S: "5" })).toBe(15_000);
    expect(collectIntervalMs({ DEVTOOLS_COLLECT_INTERVAL_S: "120" })).toBe(120_000);
  });
});

describe("parseMounts()", () => {
  it("keeps one mount per device despite systemd bind mounts", () => {
    // /proc/<pid>/mounts as seen inside a ProtectSystem/PrivateTmp service.
    const txt = [
      "/dev/sda1 / ext4 rw,relatime 0 0",
      "sysfs /sys sysfs rw 0 0",
      "/dev/sda15 /boot/efi vfat rw 0 0",
      "/dev/sdb /mnt/disks/mongo-data ext4 rw 0 0",
      "/dev/sda1 /usr ext4 ro,relatime 0 0",
      "/dev/sda1 /boot ext4 ro,relatime 0 0",
      "/dev/sda1 /etc ext4 ro,relatime 0 0",
      "/dev/sda1 /tmp ext4 rw,relatime 0 0",
      "/dev/sda1 /var/tmp ext4 rw,relatime 0 0",
      "tmpfs /home tmpfs ro 0 0",
      "",
    ].join("\n");
    expect(parseMounts(txt)).toEqual(["/", "/boot/efi", "/mnt/disks/mongo-data"]);
  });

  it("prefers the shortest path even when a bind mount is listed first", () => {
    const txt = "/dev/sda1 /etc ext4 ro 0 0\n/dev/sda1 / ext4 rw 0 0\n";
    expect(parseMounts(txt)).toEqual(["/"]);
  });
});
