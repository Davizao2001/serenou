import type { SchemaTypeDefinition } from "sanity";
import { produto } from "./produto";

/* Um tipo só, de propósito. Categorias e coleções não são documentos: são
   um campo e duas caixas de seleção dentro da peça. Assim a Grazi nunca
   precisa cadastrar uma categoria antes de cadastrar uma peça, e a mesma
   peça aparece em Vestidos, Novidades e Promoções sem ser duplicada. */
export const schemaTypes: SchemaTypeDefinition[] = [produto];
