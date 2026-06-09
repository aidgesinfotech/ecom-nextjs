import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import type { RowDataPacket } from "mysql2";
import pool from "./db";
import { shouldSkipDatabase } from "./db-build";
import {
  DEFAULT_POLICIES,
  POLICY_DB_KEY_MAP,
  POLICY_SETTING_KEYS,
  type Policies,
  type PolicySettingKey,
} from "./policy-defaults";

function rowToPolicies(rows: RowDataPacket[]): Policies {
  const map = new Map<string, string>();
  for (const row of rows) {
    map.set(String(row.setting_key), String(row.setting_value ?? ""));
  }

  return {
    privacy: map.get("policy_privacy") || DEFAULT_POLICIES.privacy,
    shipping: map.get("policy_shipping") || DEFAULT_POLICIES.shipping,
    returnRefund: map.get("policy_return_refund") || DEFAULT_POLICIES.returnRefund,
    terms: map.get("policy_terms") || DEFAULT_POLICIES.terms,
  };
}

async function loadPoliciesFromDb(): Promise<Policies> {
  if (shouldSkipDatabase()) return DEFAULT_POLICIES;

  const placeholders = POLICY_SETTING_KEYS.map(() => "?").join(", ");
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT setting_key, setting_value FROM app_settings WHERE setting_key IN (${placeholders})`,
    [...POLICY_SETTING_KEYS]
  );
  return rowToPolicies(rows);
}

const getPoliciesCached = unstable_cache(loadPoliciesFromDb, ["policies-all"], {
  revalidate: 120,
  tags: ["policies"],
});

export function invalidatePoliciesCache() {
  revalidateTag("policies", { expire: 0 });
}

export const getPolicies = cache(async (): Promise<Policies> => {
  return getPoliciesCached();
});

export async function savePolicies(policies: Policies): Promise<void> {
  const entries = Object.entries(POLICY_DB_KEY_MAP) as [keyof Policies, PolicySettingKey][];

  for (const [field, key] of entries) {
    await pool.query(
      `INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, policies[field]]
    );
  }

  invalidatePoliciesCache();
}

export async function seedDefaultPolicies(): Promise<void> {
  const defaults: [PolicySettingKey, string][] = [
    ["policy_privacy", DEFAULT_POLICIES.privacy],
    ["policy_shipping", DEFAULT_POLICIES.shipping],
    ["policy_return_refund", DEFAULT_POLICIES.returnRefund],
    ["policy_terms", DEFAULT_POLICIES.terms],
  ];

  for (const [key, value] of defaults) {
    await pool.query(
      `INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_key = setting_key`,
      [key, value]
    );
  }
}
