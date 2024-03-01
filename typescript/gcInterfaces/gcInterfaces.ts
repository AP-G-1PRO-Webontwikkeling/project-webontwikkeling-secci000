// Interface for the manufacturer information
/*export interface ManufacturerInfo {
    id: string;
    name: string;
    foundedYear: number;
    headquarters: string;
    website: string;
}*/

// Interface for the graphics card data
export interface GraphicsCard {
    id: number;
    name: string;
    description: string;
    price: number;
    productionStatus: boolean;
    releaseDate: string;
    imageURL: string;
    manufacturer: string;
    recommendedUsage: string[];
    //manufacturerInfo: ManufacturerInfo;
    manufacturerInfo: {
        id: string;
        name: string;
        foundedYear: number;
        headquarters: string;
        website: string;  
    };
}
