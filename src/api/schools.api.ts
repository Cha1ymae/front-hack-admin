import {
  deleteRealmUser,
  getRealmUser,
  listRealmUsers,
  listUsersByRealmRole,
  createRealmUser,
  assignRealmRole,
  type KeycloakUser,
} from "./keycloak-admin.api";
import type { Page } from "@/types/api";
import type { School } from "@/types/entities";

export type ListSchoolsParams = { cursor?: string; limit?: number; q?: string };

function mapKeycloakUserToSchool(user: KeycloakUser): School {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;
  return {
    id: user.id,
    keycloakId: user.id,
    name,
    address: "—",
    createdAt: user.createdTimestamp
      ? new Date(user.createdTimestamp).toISOString()
      : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function listSchools(
  params: ListSchoolsParams = {},
): Promise<Page<School>> {
  const users = await listUsersByRealmRole("school", {
    search: params.q,
    max: params.limit ?? 100,
  });
  return { items: users.map(mapKeycloakUserToSchool) };
}

export type SignUpSchoolInput = {
  email: string;
  password: string;
  name: string;
  address: string;
};

export async function createSchool(input: SignUpSchoolInput): Promise<School> {
  const created = await createRealmUser({
    username: input.email,
    email: input.email,
    firstName: input.name,
    lastName: undefined,
    password: input.password,
  });

  await assignRealmRole(created.id, "school");

  return mapKeycloakUserToSchool(created);
}

export async function getSchool(id: string): Promise<School> {
  const user = await getRealmUser(id);
  return mapKeycloakUserToSchool(user);
}

export async function deleteSchool(id: string): Promise<void> {
  await deleteRealmUser(id);
}
