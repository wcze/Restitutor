import { clamp, hasFlag, setFlag } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { hideModal } from "../../utils/ModalManager";
import type { Province } from "../definitions/Province";
import { TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import { showSuccess } from "../logic/AlertLogic";
import { getArmyMaintenanceCost, getCurrentGeneral } from "../logic/ArmyLogic";
import { addAttitudeModifier } from "../logic/DiplomacyLogic";
import { getProvinceName, getProvinceStat, setProvinceStat } from "../logic/ProvinceLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import {
   BreachOfThePeaceDurationYear,
   getTruceDuration,
   getWarPlunder,
   type IWar,
   WarFlag,
   WhitePeaceCostPerTile,
   warIsOngoingCondition,
} from "../logic/WarLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function getWarActionWarScore(war: IWar): number {
   return clamp(Math.floor(war.requiredWarScore * 0.1), 1, war.requiredWarScore);
}

export function LeaveWarCoalitionAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   let coalitionLeader: Province | undefined;
   if (war.coAttackers.has(province)) {
      coalitionLeader = war.attacker;
   }
   if (war.coDefenders.has(province)) {
      coalitionLeader = war.defender;
   }
   if (!coalitionLeader) {
      return EmptyGameAction;
   }
   const leader = coalitionLeader;
   return {
      cost: { diplomatic: WhitePeaceCostPerTile * war.tiles.size },
      condition: finalizeCondition([
         {
            name: $t(L.WeAreACoAttackerOrCoDefenderOfTheWar),
            value: war.coAttackers.has(province) || war.coDefenders.has(province),
         },
         warIsOngoingCondition(war, save),
         { name: $t(L.WarHasBeenGoingOnForAtLeastAYear), value: war.log.length >= 12 },
      ]),
      execute: ({ headless }) => {
         war.coAttackers.delete(province);
         war.coDefenders.delete(province);
         addAttitudeModifier(
            leader,
            province,
            {
               type: "add",
               name: $t(
                  L.$1LeftWarCoalitionIn$2$3War,
                  getProvinceName(province, save),
                  getProvinceName(war.attacker, save),
                  getProvinceName(war.defender, save),
               ),
               value: -50,
               duration: getTruceDuration(war, save).value,
            },
            save,
         );
         if (!headless) {
            showSuccess($t(L.WeHaveLeftThe$1War, `${war.attacker}-${war.defender}`));
            hideModal();
         }
      },
   };
}

export function ProclaimRightOfReprisalAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   return {
      cost: { diplomatic: 50 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "ProclaimRightOfReprisal" }, province, save),
         warIsOngoingCondition(war, save),
      ]),
      execute: () => {
         startTimedAction("ProclaimRightOfReprisal", province, save);
      },
      effect: {
         name: TimedActions.ProclaimRightOfReprisal.name(),
         casusBelli: {
            [war.attacker]: {
               casusBelli: "BreachOfThePeace",
               duration: BreachOfThePeaceDurationYear * 12,
            },
         },
      },
   };
}

export function MakeWarSpeechAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   const warScore = getWarActionWarScore(war);
   return {
      cost: { administrative: warScore * 10 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "MakeWarSpeech" }, province, save),
         { name: $t(L.WeAreTheLeadAttackerOfTheWar), value: war.attacker === province },
         { name: $t(L.WeAreWithinTheFirstYearOfWar), value: war.log.length <= 12 },
         warIsOngoingCondition(war, save),
      ]),
      execute: () => {
         war.actualWarScore += warScore;
         startTimedAction("MakeWarSpeech", province, save);
      },
   };
}

export function FortifyOurBordersAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   return {
      cost: { administrative: 50 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "FortifyBorders" }, province, save),
         warIsOngoingCondition(war, save),
         {
            name: $t(L.WeAreTheLeadAttackerOrDefenderOfTheWar),
            value: war.attacker === province || war.defender === province,
         },
      ]),
      execute: () => {
         startTimedAction("FortifyBorders", province, save);
      },
   };
}

export function PlunderWarTilesAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   const plunder = getWarPlunder(war, save);
   return {
      condition: finalizeCondition([
         ...timedActionConditions({ action: "PlunderWarTile" }, province, save),
         { name: $t(L.WeHaveNotPlunderedWarTilesYet), value: !hasFlag(war.flag, WarFlag.Plunder) },
         { name: $t(L.WeAreTheLeadAttackerOfTheWar), value: war.attacker === province },
         warIsOngoingCondition(war, save),
      ]),
      execute: () => {
         war.flag = setFlag(war.flag, WarFlag.Plunder);
         war.requiredWarScore += plunder.warScore.value;
      },
   };
}

export function ForceAttackAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   return {
      condition: finalizeCondition([
         ...timedActionConditions({ action: "ForceAttack" }, province, save),
         { name: $t(L.WeAreTheLeadAttackerOfTheWar), value: war.attacker === province },
         warIsOngoingCondition(war, save),
      ]),
      execute: () => {
         startTimedAction("ForceAttack", province, save);
      },
   };
}

export function DecimateOurArmyAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   const warScore = getWarActionWarScore(war);
   return {
      cost: { gold: getArmyMaintenanceCost({}, province, save).value * warScore },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "DecimateOurArmy" }, province, save),
         { name: $t(L.WeAreTheLeadAttackerOfTheWar), value: war.attacker === province },
         warIsOngoingCondition(war, save),
      ]),
      execute: () => {
         startTimedAction("DecimateOurArmy", province, save);
         war.actualWarScore += warScore;
         setProvinceStat(
            "actualConscription",
            getProvinceStat("actualConscription", province, save) * 0.9,
            province,
            save,
         );
      },
   };
}

export function getBattlePlanWarScore(province: Province, save: SaveGame): number {
   return (
      getProvinceStat("infantrySkill", province, save) +
      getProvinceStat("rangedSkill", province, save) +
      getProvinceStat("cavalrySkill", province, save)
   );
}

export function ExecuteBattlePlanAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   return {
      cost: { generalSkillPoint: 1 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "ExecuteBattlePlan" }, province, save),
         { name: $t(L.WeAreTheLeadAttackerOfTheWar), value: war.attacker === province },
         { name: $t(L.WeHaveAppointedAGeneral), value: getCurrentGeneral(province, save) !== undefined },
         warIsOngoingCondition(war, save),
      ]),
      execute: () => {
         war.actualWarScore += getBattlePlanWarScore(province, save);
         startTimedAction("ExecuteBattlePlan", province, save);
      },
   };
}
