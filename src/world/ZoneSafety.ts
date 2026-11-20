/** Settled regions retain their protection after sunset, away from a campfire. */
export function isVillageSanctuary(zoneId: string | undefined): boolean {
  return zoneId === 'bellhollow' || zoneId === 'sanctuary_farm';
}
