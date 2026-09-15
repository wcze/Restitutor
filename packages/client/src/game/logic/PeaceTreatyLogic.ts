import { $t, L } from "../../utils/i18n";
import { applyGameEffect, getGameEffectDesc, type IGameEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import { getProvinceName } from "./ProvinceLogic";
import { type IWar, isEligibleForMandate } from "./WarLogic";

interface IPeaceTreatyOption {
   name: () => string;
   modifiers?: (war: IWar, save: SaveGame) => IGameEffect;
}

export const PeaceTreatyOptions = {
   WarReparations: {
      name: () => $t(L.WarReparations),
      modifiers: (war: IWar, save: SaveGame) => {
         return {
            provinceModifiers: [
               {
                  modifier: "LandTax",
                  type: "multiply",
                  value: 0.05,
                  duration: Math.max(12, war.log.length),
                  province: war.attacker,
               },
               {
                  modifier: "LandTax",
                  type: "multiply",
                  value: -0.05,
                  duration: Math.max(12, war.log.length),
                  province: war.defender,
               },
            ],
         };
      },
   },
   ForcedDisarmament: {
      name: () => $t(L.ForcedDisarmament),
      modifiers: (war: IWar, save: SaveGame) => {
         return {
            provinceModifiers: [
               {
                  modifier: "WarPower",
                  type: "multiply",
                  value: -0.05,
                  duration: Math.max(12, war.log.length * 2),
                  province: war.defender,
               },
            ],
         };
      },
   },
   Demilitarization: {
      name: () => $t(L.Demilitarization),
      modifiers: (war: IWar, save: SaveGame) => {
         return {
            provinceModifiers: [
               {
                  modifier: "Defense",
                  type: "multiply",
                  value: -0.05,
                  duration: Math.max(12, war.log.length * 2),
                  province: war.defender,
               },
            ],
         };
      },
   },
   ForcedConcessions: {
      name: () => $t(L.ForcedConcessions),
      modifiers: (war: IWar, save: SaveGame) => {
         return {
            provinceModifiers: [
               {
                  modifier: "Stability",
                  type: "add",
                  value: -5,
                  duration: Math.max(12, war.log.length * 2),
                  province: war.defender,
               },
            ],
         };
      },
   },
   PublicHumiliation: {
      name: () => $t(L.PublicHumiliation),
      modifiers: (war: IWar, save: SaveGame) => {
         return {
            provinceModifiers: [
               {
                  modifier: "Prestige",
                  type: "multiply",
                  value: -0.05,
                  duration: Math.max(12, war.log.length * 2),
                  province: war.defender,
               },
            ],
         };
      },
   },
   Devastation: {
      name: () => $t(L.Devastation),
   },
   TriumphalUnity: {
      name: () => $t(L.TriumphalUnity),
      modifiers: (war: IWar, save: SaveGame) => {
         return {
            provinceModifiers: [
               {
                  modifier: "Stability",
                  type: "add",
                  value: 10,
                  duration: Math.max(12, war.log.length),
                  province: war.attacker,
               },
            ],
         };
      },
   },
   VictoriousPrestige: {
      name: () => $t(L.VictoriousPrestige),
      modifiers: (war: IWar, save: SaveGame) => {
         return {
            provinceModifiers: [
               {
                  modifier: "Prestige",
                  type: "multiply",
                  value: 0.1,
                  duration: Math.max(12, war.log.length),
                  province: war.attacker,
               },
            ],
         };
      },
   },
   MartialAscendancy: {
      name: () => $t(L.MartialAscendancy),
      modifiers: (war: IWar, save: SaveGame) => {
         return {
            provinceModifiers: [
               {
                  modifier: "WarPower",
                  type: "multiply",
                  value: 0.1,
                  duration: Math.max(12, war.log.length),
                  province: war.attacker,
               },
            ],
         };
      },
   },
} satisfies Record<string, IPeaceTreatyOption>;

export type PeaceTreatyOption = keyof typeof PeaceTreatyOptions;

export function getAvailablePeaceTreatyOptions(war: IWar, save: SaveGame): PeaceTreatyOption[] {
   const options: PeaceTreatyOption[] = isEligibleForMandate(war, save)
      ? ["Devastation", "TriumphalUnity", "VictoriousPrestige", "MartialAscendancy"]
      : [
           "WarReparations",
           "Devastation",
           "ForcedDisarmament",
           "Demilitarization",
           "ForcedConcessions",
           "PublicHumiliation",
        ];
   return options.filter((option) => {
      if (option !== "Devastation") {
         return true;
      }
      return Array.from(war.tiles).some((tile) => {
         const data = save.state.tiles.get(tile);
         return data && (data.infrastructure > 1 || data.production > 1 || data.population > 1);
      });
   });
}

export function getPeaceTreatyOptionDescription(option: PeaceTreatyOption, war: IWar, save: SaveGame): React.ReactNode {
   if (option === "Devastation") {
      return $t(L.$1TileUpgradesOnEachAnnexedTileMinimumReduction$2, "-10%", "1");
   }
   return getGameEffectDesc(PeaceTreatyOptions[option].modifiers(war, save), war.attacker, save);
}

export function applyPeaceTreatyOption(option: PeaceTreatyOption, war: IWar, save: SaveGame): void {
   // Devastation is handled in `SignPeaceTreatyAction`
   if (option === "Devastation") {
      return;
   }
   applyGameEffect(
      PeaceTreatyOptions[option].modifiers(war, save),
      $t(L.PeaceTreatyBetween$1And$2, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
      war.attacker,
      save,
   );
}
