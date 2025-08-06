import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Crown, Star } from "lucide-react";

export const GodsSchoolExplanation = () => {
  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Crown className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-amber-900">Școala Zeilor</h2>
        </div>
        
        <div className="space-y-4 text-amber-800">
          <p className="leading-relaxed">
            Școala Zeilor este o călătorie de transformare spirituală care te conectează cu 
            înțelepciunea divină. Prin întrebări profunde și reflecție ghidată, vei descoperi 
            calea către evoluția ta spirituală.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Înțelepciune Divină</h3>
                <p className="text-sm">Accesează principiile supreme care ghidează existența</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Transformare Spirituală</h3>
                <p className="text-sm">Evoluează prin provocările vieții cu ghidaj divin</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Crown className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Acțiune Inspirată</h3>
                <p className="text-sm">Creează un plan de acțiune aliniat cu principiile divine</p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-100 p-4 rounded-lg mt-6">
            <p className="text-sm italic">
              "Zeii nu ne dau provocări pe care nu le putem depăși. Fiecare obstacol 
              este o oportunitate de a ne alinia cu înțelepciunea divină și de a ne 
              eleva spiritul la un nivel superior."
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};