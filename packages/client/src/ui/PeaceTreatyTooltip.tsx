import { formatNumber } from "@project/shared/src/utils/Helper";
import { CasusBelli } from "../game/definitions/CasusBelli";
import {
   getPeaceTreatyOptionDescription,
   type PeaceTreatyOption,
   PeaceTreatyOptions,
} from "../game/logic/PeaceTreatyLogic";
import { getTruceDuration, type IWar, isEligibleForMandate } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { BreakdownComp } from "./BreakdownComp";
import { renderMarkup } from "./ParseMarkup";

export function PeaceTreatyTerms({ war }: { war: IWar }): React.ReactNode {
   const truceDuration = getTruceDuration(war, G.save);
   const tileNames = Array.from(war.tiles)
      .map((tile) => `<Tile>${tile}</Tile>`)
      .join(", ");
   return (
      <ul className="m10">
         {isEligibleForMandate(war, G.save) && (
            <li className="text-yellow">
               {renderMarkup($t(L.$1WillCeaseToExistWhichWillGrant$2$3Mandate, war.defender, war.attacker, "1"))}
            </li>
         )}
         <li>{renderMarkup($t(L.$1ShallCede$2To$3, war.defender, tileNames, war.attacker))}</li>
         <li>
            {renderMarkup(
               $t(
                  L.A$1MonthTruceShallBeEnactedBetween$2And$3,
                  formatNumber(truceDuration.value),
                  war.attacker,
                  war.defender,
               ),
            )}
         </li>
         <li>
            {renderMarkup(
               $t(
                  L.$1GetsA$2CasusBelliAgainst$3For$4Years,
                  war.defender,
                  CasusBelli.Reconquista.name(),
                  war.attacker,
                  "10",
               ),
            )}
         </li>
      </ul>
   );
}

export function PeaceTreatyTooltip({
   war,
   peaceTreatyOption,
}: {
   war: IWar;
   peaceTreatyOption?: PeaceTreatyOption;
}): React.ReactNode {
   const truceDuration = getTruceDuration(war, G.save);
   return (
      <>
         <div className="h2">{$t(L.PeaceTreaty)}</div>
         <PeaceTreatyTerms war={war} />
         {peaceTreatyOption && (
            <>
               <div className="h2">{PeaceTreatyOptions[peaceTreatyOption].name()}</div>
               <div className="m10">{getPeaceTreatyOptionDescription(peaceTreatyOption, war, G.save)}</div>
            </>
         )}
         <div className="h2">{$t(L.TruceDuration)}</div>
         <BreakdownComp breakdown={truceDuration} />
      </>
   );
}
