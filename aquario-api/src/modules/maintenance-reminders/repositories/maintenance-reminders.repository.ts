import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateMaintenanceReminderDto } from "../dto/create-maintenance-reminder.dto";
import { UpdateMaintenanceReminderDto } from "../dto/update-maintenance-reminder.dto";
import { ReminderStatus } from '@prisma/client';

@Injectable()
export class MaintenanceReminderRepository{
    constructor(private readonly prisma: PrismaService) {}

    create(data: CreateMaintenanceReminderDto){
        return this.prisma.maintenanceReminder.create({
            data:{
                ...data,
                dueDate: new Date(data.dueDate)
            }
            
        })
    }

    findAll(userId:number){
        return this.prisma.maintenanceReminder.findMany({
            where:{
                aquarium:{userId}
            },
            include: {
                aquarium:true,
                equipment:true
            }
        })
    }

    findByIdAndUser(id:number,userId:number){
        return this.prisma.maintenanceReminder.findUnique({
            where: {
                id,
                aquarium:{userId}
            },
            include: {
                aquarium:true,
                equipment:true
            }

        })
    }

    update(id:number, data:UpdateMaintenanceReminderDto,userId:number){
        return this.prisma.maintenanceReminder.update({
            where: {
                id,
                equipment:{
                    aquarium:{userId}
                }
            },
            data
        })
    }
    markAsDone(id:number,userId:number){
        return this.prisma.maintenanceReminder.update({
            where:{
                id,
                equipment:{
                    aquarium:{userId}
                }
            },
            data: {
                status: ReminderStatus.DONE,
                completedAt: new Date()
            }
        })
    }

    delete(id:number,userId:number){
        return this.prisma.maintenanceReminder.delete({
            where: {
                id,
                equipment:{
                    aquarium:{userId}
                }
            }
        })
    }
}