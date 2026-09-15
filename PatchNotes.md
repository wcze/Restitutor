## War 2.0

### Army Compositions and Counters

- Army Composition: the 25% cap on Ranged and Cavalry is removed - either can reach 100%. Adjusting army composition now has a 1-year cooldown.
- Unit Power Scaling: Infantry/Ranged/Cavalry retain base power of 1/2/3. General Skill Levels now add 50% of the corresponding unit's base power instead of a flat +1. Unit Power bonuses from technology, legacy upgrades, and social classes likewise change from +1 to +50% - this makes the scaling linear and equal for all unit types.
- Unit Counters: Infantry counters Cavalry, Cavalry counters Ranged, and Ranged counters Infantry - they gain 0.25% Effectiveness for each 1% of enemy's army unit that they counter, and lose 0.25% Effectiveness for unit that they are countered. Effectiveness is 100% (neutral) when viewing a province's war power without an enemy. For example, if an enemy has 20% Ranged and 10% Cavalry, our Infantry Unit will have -2.5% Effectiveness (97.5% of Base War Power).

### Peace Treaty Additional Terms

- You can now select an additional peace treaty term when singing a peace treaty after victory.
- Current options are: War Reparations, Forced Disarmament (+Gold for the victor), Demilitarization (-War Power for the defeated), Forced Concessions (-Stability for the defeated), Public Humiliation (-Prestige for the defeated), or Devastation; Complete annexations offer Devastation, Triumphal Unity, Martial Ascendancy, or Victorious Prestige.

### More Warfare Actions

- Plunder War Tiles: now reduces 20% of upgrades instead of flat -1.
- Make War Speech grants 10% of required war score (rounded down, minimum 1) instead of 1 war score. Cooldown has been increased to 2 years. Costs 10 administrative points per war score granted, replacing the previous flat cost of 50 administrative points.
- Decimate Our Army grants 10% of required war score (rounded down, minimum 1) instead of 1 war score. Gold cost equals army maintenance cost multiplied by war score granted.
- Forceful attack: We lose 5% of our standing army (reduced from 10%) when our attack is repelled.
- Execute a Battle Plan: Spend 1 general skill point to gain war score equal to total general skill levels. Requires an appointed general and has a 1-year cooldown.
- Expand "Proclaim Right Of Reprisal" to all defensive wars.

### War Related Polish

- A new war cannot be declared between provinces that are already fighting on opposing sides of an ongoing war.
- Allies, defense pact partners, and eligible client/patron partners cannot join a war coalition against a province (leader attacker/defender) with which they have an active truce.
- NPCs will raise their conscription after being attacked less aggressively than before (from 5% per attack to 2% per attack).

- Add a confirmation dialog when lowering target conscription and army maintenance (can be skipped).

## Autonomy Rework

- Each 1% autonomy now also reduces Governing Cost and Tile Defense by 0.5%.
- Autonomy changes now share a province-wide 6-month cooldown, including Reset, Settle Unrest, and automation. Unchanged values do not trigger the cooldown.
- Automatic settlement checks monthly when off cooldown and settles only the highest-unrest tile with positive unrest whose autonomy can change. It does nothing if no tile qualifies.
- Autonomy sliders in UI are adjusted to accommodate the cooldown change.

## Looming Disasters

- Currently there two kinds of "disasters" from the narrative events: barbarian formations and heresy outbreaks. Internal Affairs panel now previews the next upcoming disaster. Select "Show All" to view upcoming disasters.
- Disaster previews show the event year, description, and affected areas: tiles taken over by new barbarian polities, or provinces and tiles affected by heresies. Tile links let you locate affected areas on the map.
- Disasters within 10 years are highlighted in red and trigger a "Looming Disasters" todo icon on the right.

## Governing Cost/Capacity Balancing

- Reduce governing cost from distance from capital from 10% per tile to 5% per tile.
- Add Basilica: unlocked by Civic Education, reduces Tile Governing Cost by 40%. Costs 400 gold to build and 2 gold in maintenance.

## Map Visual

- Tiles contested in a war now shows the war progress. Every month the war result (Success, Repelled, Stalled) will show up on that tile.
- When hover over a tile contested in a war, a tooltip of that war shows up.

## Other Changes
- Extend the Administrative branch of the legacy upgrade tree.