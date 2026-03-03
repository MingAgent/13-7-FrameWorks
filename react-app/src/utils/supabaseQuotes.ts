/**
 * supabaseQuotes.ts — Save and load quotes via Supabase
 * =======================================================
 * Drop this into: react-app/src/utils/supabaseQuotes.ts
 *
 * Handles persisting customer quotes to the database and
 * computing internal BOM cost / margin analysis.
 */

import { supabase } from './supabase';

// ── Types ──

export interface QuoteData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  buildingType: string;
  buildingSizeId: string;
  width: number;
  length: number;
  eaveHeight: number;
  legType: string;
  configSnapshot: Record<string, any>;  // full accessories/colors/concrete config
  basePrice: number;
  accessoriesTotal: number;
  concreteTotal: number;
  deliveryTotal: number;
  grandTotal: number;
  depositAmount: number;
}

export interface SavedQuote extends QuoteData {
  id: string;
  quoteNumber: string;
  bomTotalCost: number | null;
  marginAmount: number | null;
  marginPct: number | null;
  status: string;
  createdAt: string;
}

// ── Save a quote ──

export async function saveQuote(data: QuoteData): Promise<SavedQuote | null> {
  try {
    // 1. Insert the quote
    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        customer_name:     data.customerName,
        customer_email:    data.customerEmail,
        customer_phone:    data.customerPhone,
        building_type:     data.buildingType,
        building_size_id:  data.buildingSizeId,
        width:             data.width,
        length:            data.length,
        eave_height:       data.eaveHeight,
        leg_type:          data.legType,
        config_snapshot:   data.configSnapshot,
        base_price:        data.basePrice,
        accessories_total: data.accessoriesTotal,
        concrete_total:    data.concreteTotal,
        delivery_total:    data.deliveryTotal,
        grand_total:       data.grandTotal,
        deposit_amount:    data.depositAmount,
        status:            'draft',
        expires_at:        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Get BOM cost analysis (internal — maps pole barn sizes to BOM data)
    const bomType = mapBuildingType(data.buildingType);
    if (bomType) {
      const { data: margin } = await supabase.rpc('get_margin_analysis', {
        p_building_type:  bomType,
        p_width:          data.width,
        p_length:         data.length,
        p_eave_height:    data.eaveHeight,
        p_customer_price: data.grandTotal,
      });

      if (margin && margin.length > 0) {
        const m = margin[0];
        // Update quote with margin data
        await supabase
          .from('quotes')
          .update({
            bom_total_cost: m.bom_total_cost,
            margin_amount:  m.margin_amount,
            margin_pct:     m.margin_pct,
          })
          .eq('id', quote.id);

        return {
          id:            quote.id,
          quoteNumber:   quote.quote_number,
          ...data,
          bomTotalCost:  m.bom_total_cost,
          marginAmount:  m.margin_amount,
          marginPct:     m.margin_pct,
          status:        'draft',
          createdAt:     quote.created_at,
        };
      }
    }

    return {
      id:            quote.id,
      quoteNumber:   quote.quote_number,
      ...data,
      bomTotalCost:  null,
      marginAmount:  null,
      marginPct:     null,
      status:        'draft',
      createdAt:     quote.created_at,
    };
  } catch (err) {
    console.error('Failed to save quote:', err);
    return null;
  }
}

// ── Load quotes ──

export async function getQuotes(limit = 50): Promise<SavedQuote[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to load quotes:', error);
    return [];
  }

  return (data || []).map(mapQuoteRow);
}

export async function getQuoteById(id: string): Promise<SavedQuote | null> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return mapQuoteRow(data);
}

// ── Helpers ──

function mapBuildingType(reactType: string): string | null {
  const map: Record<string, string> = {
    'pole-barn': 'pole_barn',
    'carport':   'carport',
    'i-beam':    'ibeam',
    'bolt-up':   'ibeam',
  };
  return map[reactType] || null;
}

function mapQuoteRow(row: any): SavedQuote {
  return {
    id:               row.id,
    quoteNumber:      row.quote_number,
    customerName:     row.customer_name,
    customerEmail:    row.customer_email,
    customerPhone:    row.customer_phone,
    buildingType:     row.building_type,
    buildingSizeId:   row.building_size_id,
    width:            row.width,
    length:           row.length,
    eaveHeight:       row.eave_height,
    legType:          row.leg_type,
    configSnapshot:   row.config_snapshot,
    basePrice:        row.base_price,
    accessoriesTotal: row.accessories_total,
    concreteTotal:    row.concrete_total,
    deliveryTotal:    row.delivery_total,
    grandTotal:       row.grand_total,
    depositAmount:    row.deposit_amount,
    bomTotalCost:     row.bom_total_cost,
    marginAmount:     row.margin_amount,
    marginPct:        row.margin_pct,
    status:           row.status,
    createdAt:        row.created_at,
  };
}
