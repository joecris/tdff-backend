import { GrandTourRider } from '../entities/grand-tour-rider.entity';

export interface GrandTourRiderRepositoryPort {
  findById(id: string): Promise<GrandTourRider | null>;
  findByGrandTourAndRider(grandTourId: string, riderId: string): Promise<GrandTourRider | null>;
  listByGrandTour(grandTourId: string): Promise<GrandTourRider[]>;
  save(grandTourRider: GrandTourRider): Promise<void>;
}
