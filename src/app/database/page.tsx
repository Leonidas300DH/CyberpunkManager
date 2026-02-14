import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FactionsTab } from "@/components/database/FactionsTab";
import { ModelsTab } from "@/components/database/ModelsTab";
import { ItemsTab } from "@/components/database/ItemsTab";

export default function DatabasePage() {
    return (
        <div className="space-y-4 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Database</h1>
            </div>

            <Tabs defaultValue="factions" className="w-full">
                <div className="overflow-x-auto pb-2">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="factions">Factions</TabsTrigger>
                        <TabsTrigger value="models">Characters</TabsTrigger>
                        <TabsTrigger value="items">Items</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="factions">
                    <FactionsTab />
                </TabsContent>
                <TabsContent value="models">
                    <ModelsTab />
                </TabsContent>
                <TabsContent value="items">
                    <ItemsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
