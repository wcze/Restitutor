import { GameStateUpdated } from "../game/Events";
import { getUpcomingDisasters } from "../game/events/DisasterLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { showPanel } from "./common/ShowPanel";
import { SidebarComp, SidebarHeader } from "./common/SidebarComp";
import { DisasterCard } from "./DisasterCard";
import { InternalAffairsPage } from "./InternalAffairsPage";

export function DisasterPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const disasters = getUpcomingDisasters(G.save);
   return (
      <SidebarComp title={<SidebarHeader title={$t(L.Disasters)} />}>
         <div className="m10">
            <button className="btn row g5" onClick={() => showPanel(InternalAffairsPage, {})}>
               <div className="mi sm">arrow_back</div>
               {$t(L.InternalAffairs)}
            </button>
            <div className="f1" />
         </div>
         {disasters.length > 0 ? (
            disasters.map((disaster) => (
               <div className="m10" key={disaster.event}>
                  <DisasterCard key={disaster.event} disaster={disaster} />
               </div>
            ))
         ) : (
            <div className="box m10 p10 text-sm text-dimmed text-center">{$t(L.NoUpcomingDisasters)}</div>
         )}
      </SidebarComp>
   );
}
