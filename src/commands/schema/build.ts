import {core, flags, SfdxCommand} from '@salesforce/command';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);
import excelUtil = require('../../scripts/createFile');

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-object-export', 'org');

export default class fileoutput extends SfdxCommand {
  
    public static description = messages.getMessage('commandDescription');
  
    public static examples = [ 
    `Example : sfdx schema:build -u LWC1_Scratch1 -o "Account,Lead,Opportunity,Contact,AccountTeamMember,OpportunityTeamMember,Campaign,CampaignMember,Product2" ` 
    ];
   
      // Comment this out if your command does not require an org username
      protected static requiresUsername = true;
  
      // Comment this out if your command does not support a hub org username
      protected static supportsDevhubUsername = true;
    
      // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
      protected static requiresProject = false;
    
    protected static flagsConfig = { 
      msg: flags.string({char: 'm', description: messages.getMessage('msgFlagDescription')}),
      force: flags.boolean({char: 'f', description: messages.getMessage('forceFlagDescription')}),
      path :  flags.string({char: 'p', description: messages.getMessage('pathFlagDescription')}),
      objects : flags.string({char: 'o', description: messages.getMessage('objectFlagDescription')}),  
    };
   
    //Must implement method - run as per contact from SfdxCommand interface
    public async run(): Promise<core.AnyJson> {
      this.ux.log(this.flags.objects);

      const objects = this.flags.objects  ;     
      const filePath = this.flags.path || "/Users/jitendra.zaaibm.com/Desktop/ObjectInfo.xlsx" ;  

      const conn = this.org.getConnection();
             
      interface sObject {
        activateable: boolean;
        createable: boolean;
        custom: boolean;
        customSetting: boolean;
        deletable: boolean;
        deprecatedAndHidden: boolean;
        feedEnabled: boolean;
        hasSubtypes: boolean;
        isSubtype: boolean;
        keyPrefix: string;
        label: string;
        labelPlural: string;
        layoutable: boolean;
        mergeable: boolean;
        mruEnabled: boolean;
        name: string;
        queryable: boolean;
        replicateable: boolean;
        retrieveable: boolean;
        searchable: boolean;
        triggerable: boolean;
        undeletable: boolean; 
      }

      interface fieldInfo{
        label : string;
        name : string;
        custom : boolean;
        inlineHelpText : string ;
        calculatedFormula : string;
        length : number ;
        type : string;
        unique : string ;
        precision : number;
        scale : number;
        encrypted : boolean;
        externalId : boolean;
        picklistValues:Array<pickList>;
        updateable: boolean;
        nillable : boolean; 
        createable: boolean;
      }
      interface pickList{
        label : string;
        value : string;
      }
      interface objectDesc{
        name : string;
        fields:Array<fieldInfo>;
      }

      interface sobjectRes{
        encoding:string;
        maxBatchSize : number;
        sobjects : Array<sObject>;
    }
 
    //this.ux.log(this.flags.objects);

    var objNames = new Array<String>();
    var combinedMetadata = new Array<objectDesc>();

    if(objects){ 
        var objectContext = objects.split(',');
        objectContext.forEach(element => {
            objNames.push(element); 
        });
    }else{
        const objNameResult = await conn.request('/services/data/v43.0/sobjects'); 
        var sObjectRef = objNameResult as sobjectRes;    
        for(var i=0;i<sObjectRef.sobjects.length;i++){       
            objNames.push(sObjectRef.sobjects[i].name);   
        }
    }

    for(var i =0 ; i< objNames.length; i++){
        this.ux.log('Getting Field Metadata From : '+objNames[i]);
        let fldResult = await conn.request('/services/data/v43.0/sobjects/'+objNames[i]+'/describe');
        var objRes = fldResult as objectDesc;  
        combinedMetadata.push(objRes);
    }

      await excelUtil.createFile(filePath,combinedMetadata);
      this.ux.log('Excel File created at - '+filePath);
 
      return { orgId: this.org.getOrgId() , "Dreamforce":"Best time of Year" };
    }
  }
  