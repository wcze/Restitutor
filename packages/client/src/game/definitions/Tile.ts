import { pointToTile, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import { makeNoise2D } from "open-simplex-noise";
import type { SaveGame } from "../GameState";
import { getTileTerrain } from "../logic/TileLogic";
import { MapGrid } from "../MapGrid";
import { RomeMap } from "../RomeMap";
import type { Building } from "./Building";
import type { Culture } from "./Culture";
import type { Goods } from "./Goods";
import type { IModifier } from "./Modifier";
import { Province } from "./Province";
import type { Religion } from "./Religion";
import type { Terrain } from "./Terrain";

export interface ITileConfig {
   province?: Province;
   name?: string;
   isCapital?: boolean;
}

export interface ITileData {
   nameOverride?: string;
   province: Province;
   coreProvinces: Set<Province>;
   originalProvince: Province;
   culture: Culture;
   religion: Religion;
   goods: Goods;
   goodsOptions?: Goods[];
   goodsChangedAt?: number;
   buildings: Set<Building>;

   infrastructure: number;
   production: number;
   population: number;
   upgradeCount: number;
   rebellion: number;
   autonomy: number;

   modifiers: {
      GoverningCapacity: IModifier[];
      Defense: IModifier[];
      Manpower: IModifier[];
      LandTax: IModifier[];
      TileOutput: IModifier[];
      Maintenance: IModifier[];
      Unrest: IModifier[];
   };
}

export function getBorderingProvinces(tile: Tile, save: SaveGame): Province[] {
   const result: Province[] = [];
   const province = save.state.tiles.get(tile)?.province;
   if (!province) {
      return [];
   }
   for (let dir = 0; dir < 6; dir++) {
      const neighbor = pointToTile(MapGrid.getNeighbor(tileToPoint(tile), dir));
      const neighborProvince = save.state.tiles.get(neighbor)?.province;
      if (neighborProvince && neighborProvince !== province) {
         result.push(neighborProvince);
      }
   }
   return result;
}

export const TerrainToGoods: Record<Terrain, Goods[]> = {
   Forest: ["wood", "livestock", "ironOre"],
   Mountain: ["ironOre", "wood", "livestock"],
   Hill: ["ironOre", "livestock", "wood"],
   Plain: ["grain", "livestock", "wood"],
   Arid: ["ironOre", "grain", "livestock"],
};

export function initTiles(): Map<Tile, ITileData> {
   const noise = makeNoise2D(Date.now());
   return new Map(
      Array.from(RomeMap.entries()).map(([tile, config]) => {
         if (!config.name || !config.province) {
            throw new Error(`Invalid tile config: ${tile}: ${JSON.stringify(config)}`);
         }
         const { x, y } = tileToPoint(tile);
         const terrain = getTileTerrain(tile);
         const terrainGoods = TerrainToGoods[terrain];
         const countRandom = Math.random();
         const count = countRandom < 0.5 ? 1 : countRandom < 0.9 ? 2 : 3;
         const options = terrainGoods
            .map((goods, index) => ({ goods, value: (noise(x + 1000 + index * 37, y - 1000) + 1) / 2 }))
            .sort((a, b) => a.value - b.value)
            .slice(0, Math.min(count, terrainGoods.length))
            .map(({ goods }) => goods);
         const data: ITileData = initTileData(config.province, options[0], options);
         return [tile, data];
      }),
   );
}

export function initTileData(province: Province, goods: Goods, goodsOptions: Goods[] = [goods]): ITileData {
   const provinceConfig = Province[province];
   return {
      province: province,
      coreProvinces: new Set([province]),
      originalProvince: province,
      culture: provinceConfig.culture,
      religion: provinceConfig.religion,
      goods: goods,
      goodsOptions: goodsOptions,
      buildings: new Set(),
      infrastructure: 0,
      production: 0,
      population: 0,
      upgradeCount: 0,
      rebellion: 0,
      autonomy: 0,
      modifiers: {
         GoverningCapacity: [],
         Defense: [],
         Manpower: [],
         LandTax: [],
         TileOutput: [],
         Maintenance: [],
         Unrest: [],
      },
   };
}
