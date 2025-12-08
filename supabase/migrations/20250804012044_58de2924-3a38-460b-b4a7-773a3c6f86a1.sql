-- Add 'Pago pendiente' to vehicle_status enum
ALTER TYPE vehicle_status ADD VALUE IF NOT EXISTS 'Pago pendiente';