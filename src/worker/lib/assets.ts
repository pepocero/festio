import { deleteAssetByR2Key } from '../db/queries';

export async function deleteUserAsset(
	env: Env,
	userId: string,
	r2Key: string,
): Promise<void> {
	const prefix = `users/${userId}/`;
	if (!r2Key.startsWith(prefix) || r2Key.includes('..')) {
		return;
	}

	await env.ASSETS.delete(r2Key);
	await deleteAssetByR2Key(env.DB, userId, r2Key);
}
