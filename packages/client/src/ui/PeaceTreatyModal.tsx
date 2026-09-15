import { cls } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { SignPeaceTreatyAction } from "../game/actions/SignPeaceTreatyAction";
import type { Province } from "../game/definitions/Province";
import { GameStateUpdated } from "../game/Events";
import {
   getAvailablePeaceTreatyOptions,
   getPeaceTreatyOptionDescription,
   type PeaceTreatyOption,
   PeaceTreatyOptions,
} from "../game/logic/PeaceTreatyLogic";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import type { IWar } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { PeaceTreatyTerms, PeaceTreatyTooltip } from "./PeaceTreatyTooltip";
import { Grid2 } from "./UIConstant";

export function PeaceTreatyModal({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const options = getAvailablePeaceTreatyOptions(war, G.save);
   const [selectedOption, setSelectedOption] = useState<PeaceTreatyOption>(options[0]);
   return (
      <ModalComp
         size="md"
         title={
            <ModalTitleBar
               title={$t(
                  L.PeaceTreatyBetween$1And$2,
                  getProvinceName(war.attacker, G.save),
                  getProvinceName(war.defender, G.save),
               )}
               dismiss
            />
         }
      >
         <PeaceTreatyTerms war={war} />
         <div className="h1">
            {$t(L.AdditionalTerms)} {$t(L.ChooseOne)}
         </div>
         <div style={Grid2} className="m10">
            {options.map((availableOption) => (
               <div
                  className={cls("box pointer", selectedOption === availableOption ? "primary text-primary" : null)}
                  key={availableOption}
                  onClick={() => setSelectedOption(availableOption)}
               >
                  <div className="h3 row">
                     <div className={cls(selectedOption === availableOption ? "text-primary" : null)}>
                        {PeaceTreatyOptions[availableOption].name()}
                     </div>
                     <div className="f1" />
                     {selectedOption === availableOption && <div className="mi xs text-primary">check_circle</div>}
                  </div>
                  <div className="m10 text-sm">{getPeaceTreatyOptionDescription(availableOption, war, G.save)}</div>
               </div>
            ))}
         </div>
         <div className="m10">
            <ActionButton
               id="PeaceTreatyModal_SignPeaceTreaty"
               className="py2 primary w100"
               action={() => SignPeaceTreatyAction(war, province, selectedOption, G.save)}
               tooltip={(element) => (
                  <>
                     {element}
                     <PeaceTreatyTooltip war={war} peaceTreatyOption={selectedOption} />
                  </>
               )}
            >
               {$t(L.SignPeaceTreaty)}
            </ActionButton>
         </div>
      </ModalComp>
   );
}
