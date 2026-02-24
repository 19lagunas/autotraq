import { PrismaClient } from '@prisma/client';
import {Part, PartCondition, Vehicle, PartFitment, InterchangeGroup, InterchangeGroupMember} from './schema.prisma';

const prisma = new PrismaClient();


// The Drilldown calls through the separate tables to find the part being searched for
// I can change how the function asks for data, as I'm not sure how the front end / visuals want to ask for this

// Call for this function like this drilldown(year, make, model, name, sku, condition)

// 1) Given a year, make, and model we find all cars desired from Vehicle table
// 2) use vehicleId to all parts of that vehicle
// 3) search through all parts table for parts that match with the vehicle, and have the name and sku desired
// 4) for each part, dig through interchanges
    // 5) find each parts interchange ID, then that iID's interchange group, then add each part of that interchange group

    //step 4 used to add the individual part, but adding its entire interchange group also achieves this, and we don't need duplicates

async function drilldown(in_year: number, in_make: string, in_model: string, in_name: string, in_sku: string, in_condition: PartCondition): Promise<Part[]>{
  const partsFound: Part[] = []
  // Step 1
  const vehicles = await prisma.vehicle.findMany({
    where: { 
        year: in_year, 
        make: in_make, 
        model: in_model 
    }
  });

  
  for (const this_vehicle of vehicles){
    // Step 2
    const partFits = await prisma.part_fitments.findMany({
        where: {vehicleId: this_vehicle.id
        }
    });
    
    for (const partFit of partFits){
        // Step 3
        const parts = await prisma.parts.findmany({
            where: { AND: {
                id: partFit.partId,
                name: in_name,
                sku: in_sku
                }
            }
        });
        
        
        for (const part of parts){
            // Step 4
            // partsFound.push(part);
            const interchangeGroup = await prisma.interchange_group_members.findMany({
                where: {
                    partId: part.part
                }
            });
           
            // Step 5
            for (const uniqueGroup of interchangeGroup){
                // take groupId and find interchangeGroup
                // add every part from the interchange group
                const iGroup = await prisma.interchange_groups.findfirst({
                    where: {
                        group: uniqueGroup.group
                    }
                })

                for (const ipart of iGroup.members){
                    partsFound.push(ipart);
                }
            }
        }
        

    }

  }

  
return partsFound
}

