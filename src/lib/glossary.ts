/**
 * Combat Zone Glossary
 * Source: Cyberpunk_Rulebook_v26.pdf
 */

export const RULEBOOK_SOURCE = 'Cyberpunk_Rulebook_v26.pdf';

export interface GlossaryEntry {
    term: string;
    definition: string;
    definition_fr?: string;
    page?: string;
    /** Whether this term should be detected & linked in card text */
    highlight?: boolean;
}

export const GLOSSARY: GlossaryEntry[] = [
    // ── A ──
    { term: 'Accurate', definition: 'You may re-roll Accurate actions after rolling. Each die may only be re-rolled once.', definition_fr: 'Vous pouvez relancer les actions Accurate après avoir lancé les dés. Chaque dé ne peut être relancé qu\'une seule fois.', page: 'p.39', highlight: true },
    { term: 'Action', definition: 'A single activity performed by a single model (movement, attacking, healing, hacking, etc.).', definition_fr: 'Une activité unique effectuée par un seul modèle (déplacement, attaque, soin, hacking, etc.).', page: 'p.14' },
    { term: 'Action Dice', definition: 'The GREEN, YELLOW, and RED dice used when attempting an action.', definition_fr: 'Les dés GREEN, YELLOW et RED utilisés lors de la résolution d\'une action.', page: 'p.6' },
    { term: 'Action Token', definition: 'A marker indicating whether a character has an action available and the color of die used to resolve that action.', definition_fr: 'Un marqueur indiquant si un personnage dispose d\'une action disponible et la couleur du dé utilisé pour résoudre cette action.', page: 'p.6', highlight: true },
    { term: 'Activate', definition: 'Selecting a model to become the Active Model.', definition_fr: 'Choisir un modèle pour qu\'il devienne le modèle actif.', page: 'p.12' },
    { term: 'Active Model', definition: 'The model currently taking an action.', definition_fr: 'Le modèle qui est en train d\'effectuer une action.', page: 'p.12' },
    { term: 'Armor', definition: 'Protective equipment used for an Opposed Roll instead of a Skill. Armor from a Character Card can always be used. Armor from a Gear Card can only be used until it fails to protect the wearer.', definition_fr: 'Équipement de protection utilisé pour un jet opposé à la place d\'une Compétence. L\'armure d\'une Character Card peut toujours être utilisée. L\'armure d\'une Gear Card ne peut être utilisée que jusqu\'à ce qu\'elle échoue à protéger son porteur.', page: 'p.26', highlight: true },
    { term: 'Attack', definition: 'An action that causes a wound if successful. May only target rival models.', definition_fr: 'Une action qui inflige une blessure en cas de succès. Ne peut cibler que des modèles adverses.', page: 'p.15' },

    // ── B ──
    { term: 'Barrier', definition: 'A piece of scenery a model cannot move through (e.g., a solid wall).', definition_fr: 'Un élément de décor qu\'un modèle ne peut pas traverser (ex. un mur solide).', page: 'p.20' },
    { term: 'Basic Actions', definition: 'Six standard actions any model may take (one for each Skill).', definition_fr: 'Six actions standard que tout modèle peut effectuer (une par Compétence).', page: 'p.15\u201317' },
    { term: 'Battlespace', definition: 'The area where the game takes place, including scenery and deployment areas.', definition_fr: 'La zone où se déroule la partie, incluant le décor et les zones de déploiement.', page: 'p.38' },
    { term: 'Blast', definition: 'An action affecting models within a radius.', definition_fr: 'Une action qui affecte tous les modèles dans un rayon donné.', page: 'p.39', highlight: true },
    { term: 'Body Token', definition: 'A marker indicating where a model was taken out. Characters may Loot the Body for equipment.', definition_fr: 'Un marqueur indiquant l\'endroit où un modèle a été mis hors de combat. Les personnages peuvent piller le corps pour récupérer de l\'équipement.', page: 'p.29', highlight: true },
    { term: 'Brawl', definition: 'A situation where rival models are within reach of each other. Action and targeting options are limited.', definition_fr: 'Une situation où des modèles adverses sont à portée de corps à corps. Les options d\'action et de ciblage sont limitées.', page: 'p.26', highlight: true },
    { term: 'Bulky', definition: 'A model may have a maximum of one Bulky Gear.', definition_fr: 'Un modèle ne peut posséder qu\'un seul équipement Bulky au maximum.', page: 'p.37', highlight: true },

    // ── C ──
    { term: 'Campaign', definition: 'A series of linked scenarios.', definition_fr: 'Une série de scénarios enchaînés.', page: 'p.42' },
    { term: 'Character', definition: 'A capable team member, typically with multiple Action Tokens and special abilities.', definition_fr: 'Un membre d\'équipe expérimenté, disposant généralement de plusieurs Action Tokens et de capacités spéciales.', page: 'p.9' },
    { term: 'Character Card', definition: 'A card showing the rules for a specific character model.', definition_fr: 'Une carte présentant les règles d\'un modèle de personnage spécifique.', page: 'p.9' },
    { term: 'Climb', definition: 'Moving up or down a vertical barrier.', definition_fr: 'Se déplacer vers le haut ou le bas d\'une surface verticale.', page: 'p.22' },
    { term: 'Command Action', definition: 'An action allowing a character to activate another model outside the normal exchange of Control.', definition_fr: 'Une action permettant à un personnage d\'activer un autre modèle en dehors de l\'échange normal de contrôle.', page: 'p.19' },
    { term: 'Control', definition: 'The active player has Control. Only the player with Control may activate a model.', definition_fr: 'Le joueur actif a le Contrôle. Seul le joueur qui a le Contrôle peut activer un modèle.', page: 'p.12' },
    { term: 'Complex Action', definition: 'Cannot be attempted if enemy models are within RED.', definition_fr: 'Ne peut pas être tentée si des modèles ennemis sont à portée RED.', page: 'p.40', highlight: true },
    { term: 'Complex', definition: 'Cannot be attempted if enemy models are within RED.', definition_fr: 'Ne peut pas être tentée si des modèles ennemis sont à portée RED.', page: 'p.40', highlight: true },
    { term: 'Crit', definition: 'The highest value on a die. Usually an automatic success and may trigger additional effects.', definition_fr: 'La valeur la plus haute sur un dé. Généralement un succès automatique pouvant déclencher des effets supplémentaires.', page: 'p.17', highlight: true },
    { term: 'Cyber-Character', definition: 'A character equipped with Cybergear.', definition_fr: 'Un personnage équipé de Cybergear.', page: 'p.37' },

    // ── D ──
    { term: 'Dangerous Action', definition: 'If a model rolls a Fumble when attempting this action, he takes a wound.', definition_fr: 'Si un modèle obtient un Fumble en tentant cette action, il subit une blessure.', page: 'p.40', highlight: true },
    { term: 'Dangerous', definition: 'If a model rolls a Fumble when attempting this action, he takes a wound.', definition_fr: 'Si un modèle obtient un Fumble en tentant cette action, il subit une blessure.', page: 'p.40', highlight: true },
    { term: 'Deadly', definition: 'Deal an additional wound when they hit.', definition_fr: 'Inflige une blessure supplémentaire lors d\'un toucher.', page: 'p.40', highlight: true },
    { term: 'Deadly Crits', definition: 'Deal an additional wound if a Crit is rolled.', definition_fr: 'Inflige une blessure supplémentaire si un Crit est obtenu.', page: 'p.40', highlight: true },
    { term: 'Defense', definition: 'A bonus to the listed Skill that only applies when opposing (defending against) an action.', definition_fr: 'Un bonus à la Compétence indiquée qui ne s\'applique que lors d\'un jet opposé (en défense).', page: 'p.40', highlight: true },
    { term: 'Deploy', definition: 'Placing a model on the table to enter the Battlespace.', definition_fr: 'Placer un modèle sur la table pour qu\'il entre dans le Battlespace.', page: 'p.38', highlight: true },
    { term: 'Difficult Action', definition: 'May only be used once until the team is Inspired.', definition_fr: 'Ne peut être utilisée qu\'une seule fois jusqu\'à ce que l\'équipe soit Inspirée.', page: 'p.19', highlight: true },
    { term: 'Difficult', definition: 'May only be used once until the team is Inspired.', definition_fr: 'Ne peut être utilisée qu\'une seule fois jusqu\'à ce que l\'équipe soit Inspirée.', page: 'p.19', highlight: true },
    { term: 'Discard', definition: 'After use, the Gear or Loot card is discarded.', definition_fr: 'Après utilisation, la carte Gear ou Loot est défaussée.', page: 'p.40', highlight: true },
    { term: 'Drag', definition: 'Using a Move Action to relocate a rival or object. Dragging is limited to RED range.', definition_fr: 'Utiliser une action de déplacement pour repositionner un adversaire ou un objet. Le Drag est limité à la portée RED.', page: 'p.21, 27', highlight: true },

    // ── E ──
    { term: 'Easy Action', definition: 'An action that does not require a roll (an Action Token is still used).', definition_fr: 'Une action qui ne nécessite pas de jet de dés (un Action Token est tout de même dépensé).', page: 'p.14' },
    { term: 'EB', definition: 'Eurobucks \u2014 The currency used when creating your team.', definition_fr: 'Eurobucks \u2014 La monnaie utilisée lors de la création de votre équipe.', page: 'p.9, 37' },
    { term: 'Escape', definition: 'Leaving a Brawl using Reflexes opposed by a rival\'s Reflexes.', definition_fr: 'Quitter un Brawl en utilisant les Reflexes contre les Reflexes d\'un adversaire.', page: 'p.26' },
    { term: 'Exhaust', definition: 'Flip a card face down. Exhausted cards have no active text until refreshed.', definition_fr: 'Retourner une carte face cachée. Les cartes épuisées n\'ont aucun texte actif tant qu\'elles ne sont pas rechargées.', page: 'p.13', highlight: true },

    // ── F ──
    { term: 'Faction', definition: 'One of the groups competing to control the Combat Zone. A team may only include members of one faction (plus Mercs).', definition_fr: 'Un des groupes qui s\'affrontent pour contrôler la Combat Zone. Une équipe ne peut inclure que des membres d\'une seule faction (plus des Mercs).', page: 'p.36' },
    { term: 'Fail', definition: 'An action is unsuccessful if the total is lower than or equal to the Opposed Roll.', definition_fr: 'Une action échoue si le total est inférieur ou égal au jet opposé.', page: 'p.6' },
    { term: 'Fall', definition: 'Involuntary vertical movement that may cause wounds.', definition_fr: 'Déplacement vertical involontaire pouvant causer des blessures.', page: 'p.22' },
    { term: 'Friendly', definition: 'Models controlled by the same player.', definition_fr: 'Modèles contrôlés par le même joueur.', page: 'p.7' },
    { term: 'Free Action', definition: 'An action that does not use an Action Token.', definition_fr: 'Une action qui ne dépense pas d\'Action Token.', page: 'p.19', highlight: true },
    { term: 'Fumble', definition: 'The lowest value on a die. Automatic failure and may trigger additional effects.', definition_fr: 'La valeur la plus basse sur un dé. Échec automatique pouvant déclencher des effets supplémentaires.', page: 'p.6', highlight: true },

    // ── G ──
    { term: 'Gear', definition: 'Equipment or weapons providing additional actions and/or abilities.', definition_fr: 'Équipement ou armes fournissant des actions et/ou capacités supplémentaires.', page: 'p.11, 26, 37', highlight: true },
    { term: 'Gonk', definition: 'A novice team member representing rank-and-file muscle.', definition_fr: 'Un membre d\'équipe novice représentant la chair à canon de base.', page: 'p.9', highlight: true },
    { term: 'Gonk Card', definition: 'A card showing the stats and rules for a type of Gonk model.', definition_fr: 'Une carte affichant les caractéristiques et les règles d\'un type de modèle Gonk.', page: 'p.9' },

    // ── H ──
    { term: 'Hacked', definition: 'A Netrunner places a Hacked token on a rival whose cyberware he has accessed.', definition_fr: 'Un Netrunner place un jeton Hacked sur un adversaire dont il a accédé aux cyberimplants.', page: 'p.35', highlight: true },
    { term: 'Heal', definition: 'Removing a wound and restoring one Action Token to its normal color.', definition_fr: 'Retirer une blessure et restaurer un Action Token à sa couleur normale.', page: 'p.30', highlight: true },

    // ── I ──
    { term: 'Impact Token', definition: 'A marker indicating the center of a Blast.', definition_fr: 'Un marqueur indiquant le centre d\'un Blast.', page: 'p.39', highlight: true },
    { term: 'Indirect', definition: 'Ignores obstacles in the Path of Attack.', definition_fr: 'Ignore les obstacles dans la trajectoire d\'attaque.', page: 'p.40', highlight: true },
    { term: 'Inspire Your Team', definition: 'When gaining Control, activate all Gonks (one action each) while characters refresh their Action Tokens.', definition_fr: 'Lorsque vous obtenez le Contrôle, activez tous les Gonks (une action chacun) pendant que les personnages rechargent leurs Action Tokens.', page: 'p.12', highlight: true },
    { term: 'Install', definition: 'Assign a program to a Netrunner.', definition_fr: 'Assigner un programme à un Netrunner.', page: 'p.34' },

    // ── J ──
    { term: 'Jump', definition: 'A model may attempt to jump across a gap up to RED.', definition_fr: 'Un modèle peut tenter de sauter par-dessus un vide jusqu\'à la portée RED.', page: 'p.21' },

    // ── L ──
    { term: 'Launch', definition: 'Use a program\'s effect without spending an action.', definition_fr: 'Utiliser l\'effet d\'un programme sans dépenser d\'action.', page: 'p.34', highlight: true },
    { term: 'Leader', definition: 'The centerpiece of a team. Each team must include exactly one Leader.', definition_fr: 'La pièce maîtresse d\'une équipe. Chaque équipe doit inclure exactement un Leader.', page: 'p.36' },
    { term: 'Limiter', definition: 'The measuring device divided into GREEN, YELLOW, and RED lengths. The width measures reach distance.', definition_fr: 'L\'outil de mesure divisé en longueurs GREEN, YELLOW et RED. La largeur mesure la distance de corps à corps.', page: 'p.7' },
    { term: 'Loaded', definition: 'A program that is available to use (Loaded side up).', definition_fr: 'Un programme disponible à l\'utilisation (face Loaded visible).', page: 'p.34', highlight: true },
    { term: 'Long Range', definition: 'The area beyond GREEN range of the Limiter.', definition_fr: 'La zone au-delà de la portée GREEN du Limiter.', page: 'p.14', highlight: true },
    { term: 'Loot', definition: 'Taking Gear or drawing a Loot card from a model that has been taken out.', definition_fr: 'Récupérer du Gear ou piocher une carte Loot sur un modèle mis hors de combat.', page: 'p.30', highlight: true },
    { term: 'Luck Token', definition: 'Spend to re-roll a single die. Players typically start with three.', definition_fr: 'Dépenser pour relancer un seul dé. Les joueurs en ont généralement trois au départ.', page: 'p.13', highlight: true },

    // ── M ──
    { term: 'Memory Leak', definition: 'When a Netrunner Fumbles a program, he must suffer Stun 1 or take a wound.', definition_fr: 'Lorsqu\'un Netrunner obtient un Fumble sur un programme, il doit subir Stun 1 ou prendre une blessure.', page: 'p.35', highlight: true },
    { term: 'Merc', definition: 'A character not loyal to a single faction. May be included in any team.', definition_fr: 'Un personnage sans allégeance à une faction particulière. Peut être inclus dans n\'importe quelle équipe.', page: 'p.37' },
    { term: 'Model', definition: 'A single combatant represented by a miniature.', definition_fr: 'Un combattant unique représenté par une figurine.', page: 'p.7' },
    { term: 'Move Action', definition: 'An action allowing a model to change location within the Battlespace.', definition_fr: 'Une action permettant à un modèle de se déplacer dans le Battlespace.', page: 'p.20' },

    // ── N ──
    { term: 'Netrunner', definition: 'A character able to Hack rivals and install programs.', definition_fr: 'Un personnage capable de pirater des adversaires et d\'installer des programmes.', page: 'p.34', highlight: true },

    // ── O ──
    { term: 'Obstacle', definition: 'Scenery that a model can move through or over.', definition_fr: 'Un élément de décor qu\'un modèle peut traverser ou enjamber.', page: 'p.20', highlight: true },
    { term: 'Obstacle Die', definition: 'A black 10-sided die used when no rival model is targeted.', definition_fr: 'Un dé noir à 10 faces utilisé lorsqu\'aucun modèle adverse n\'est ciblé.', page: 'p.6' },
    { term: 'Opposed Roll', definition: 'A roll made by the target to determine success or failure.', definition_fr: 'Un jet effectué par la cible pour déterminer le succès ou l\'échec.', page: 'p.6, 14' },

    // ── P ──
    { term: 'Path of Attack', definition: 'An imaginary straight line between the Active Model and its target, equal to the width of the Limiter.', definition_fr: 'Une ligne droite imaginaire entre le modèle actif et sa cible, d\'une largeur égale à celle du Limiter.', page: 'p.24', highlight: true },
    { term: 'Pierce', definition: 'Reduces the value of the target\'s Armor.', definition_fr: 'Réduit la valeur de l\'Armor de la cible.', page: 'p.40', highlight: true },
    { term: 'Program', definition: 'A special action available only to Netrunners.', definition_fr: 'Une action spéciale disponible uniquement pour les Netrunners.', page: 'p.34\u201335' },
    { term: 'Push', definition: 'Moves the target RED directly away from the Active Model.', definition_fr: 'Déplace la cible d\'une distance RED directement à l\'opposé du modèle actif.', page: 'p.40', highlight: true },

    // ── Q ──
    { term: 'Quarter', definition: 'One fourth of the Battlespace.', definition_fr: 'Un quart du Battlespace.', page: 'p.38' },

    // ── R ──
    { term: 'Range', definition: 'The distance between the Active Model and its target.', definition_fr: 'La distance entre le modèle actif et sa cible.', page: 'p.14' },
    { term: 'Rapid', definition: 'Allows the same action to be taken without spending additional actions.', definition_fr: 'Permet d\'effectuer la même action sans dépenser d\'actions supplémentaires.', page: 'p.41', highlight: true },
    { term: 'Rarity', definition: 'The maximum number of a single Gear or Program card your team may include.', definition_fr: 'Le nombre maximum d\'une même carte Gear ou Program que votre équipe peut inclure.', page: 'p.37' },
    { term: 'Reach', definition: 'The width of the Limiter; hand-to-hand distance.', definition_fr: 'La largeur du Limiter ; la distance de corps à corps.', page: 'p.7', highlight: true },
    { term: '[RE]action', definition: 'A special action taken immediately after being wounded.', definition_fr: 'Une action spéciale effectuée immédiatement après avoir été blessé.', page: 'p.31', highlight: true },
    { term: 'Ready', definition: 'A face-up Action Token that can be spent.', definition_fr: 'Un Action Token face visible qui peut être dépensé.', page: 'p.13', highlight: true },
    { term: 'Red-Lined', definition: 'A character that has only RED Action Tokens remaining.', definition_fr: 'Un personnage qui n\'a plus que des Action Tokens RED.', page: 'p.28', highlight: true },
    { term: 'Refresh', definition: 'Flip Used Action Tokens to Ready or exhausted cards face up.', definition_fr: 'Retourner les Action Tokens utilisés en position Ready ou les cartes épuisées face visible.', page: 'p.12, 40', highlight: true },
    { term: 'Reload', definition: 'Flip a program card to the Loaded side.', definition_fr: 'Retourner une carte programme sur la face Loaded.', page: 'p.34', highlight: true },
    { term: 'Reserve', definition: 'A model not deployed at the start of the game.', definition_fr: 'Un modèle non déployé au début de la partie.', page: 'p.38' },
    { term: 'Rival', definition: 'A model controlled by the opposing player.', definition_fr: 'Un modèle contrôlé par le joueur adverse.', page: 'p.7' },

    // ── S ──
    { term: 'Scenario', definition: 'A single game of Combat Zone.', definition_fr: 'Une partie unique de Combat Zone.', page: 'p.8, 43' },
    { term: 'Scenario Sheet', definition: 'A page describing setup, rules, and goals for a scenario.', definition_fr: 'Une page décrivant la mise en place, les règles et les objectifs d\'un scénario.', page: 'p.43' },
    { term: 'Scenery', definition: 'Any terrain in the Battlespace (Obstacle or Barrier).', definition_fr: 'Tout élément de terrain dans le Battlespace (Obstacle ou Barrier).', page: 'p.20, 38' },
    { term: 'Silent', definition: '[RE]actions to Silent actions may only target the attacker if the Path of Attack is not obscured.', definition_fr: 'Les [RE]actions aux actions Silent ne peuvent cibler l\'attaquant que si la trajectoire d\'attaque n\'est pas obstruée.', page: 'p.41', highlight: true },
    { term: 'Skill', definition: 'One of six core abilities: Reflexes, Ranged, Melee, Medical, Tech, Influence.', definition_fr: 'L\'une des six compétences principales : Reflexes, Ranged, Melee, Medical, Tech, Influence.', page: 'p.9\u201314' },
    { term: 'Specialist', definition: 'Rare individual; your team may include only one of each Specialist model.', definition_fr: 'Individu rare ; votre équipe ne peut inclure qu\'un seul exemplaire de chaque modèle Specialist.', highlight: true },
    { term: 'Street Cred', definition: 'Reputation required to access certain Gear or characters.', definition_fr: 'La réputation nécessaire pour accéder à certains Gear ou personnages.', page: 'p.9, 37, 44' },
    { term: 'Stun', definition: 'May force a character to flip Ready Action Tokens or prevent a Gonk from acting during Inspire Your Team.', definition_fr: 'Peut forcer un personnage à retourner ses Action Tokens Ready ou empêcher un Gonk d\'agir lors de Inspire Your Team.', page: 'p.41', highlight: true },
    { term: 'Succeed', definition: 'An action succeeds if the total is higher than the Opposed Roll.', definition_fr: 'Une action réussit si le total est supérieur au jet opposé.', page: 'p.6, 14' },
    { term: 'Suppression', definition: 'Characters may only [RE]act to Suppression attacks with a Move Action.', definition_fr: 'Les personnages ne peuvent réagir aux attaques Suppression qu\'avec une action de déplacement.', page: 'p.41', highlight: true },

    // ── T ──
    { term: 'Taken Out', definition: 'A model eliminated from combat and replaced with a Body Token.', definition_fr: 'Un modèle éliminé du combat et remplacé par un Body Token.', page: 'p.29', highlight: true },
    { term: 'Target', definition: 'The intended recipient of an action\'s effects.', definition_fr: 'Le destinataire visé par les effets d\'une action.', page: 'p.14, 24' },
    { term: 'Team', definition: 'All models controlled by a single player.', definition_fr: 'Tous les modèles contrôlés par un seul joueur.', page: 'p.8, 44' },
    { term: 'Torrent', definition: 'Targets all models in the Path of Attack, both friendly and rival.', definition_fr: 'Cible tous les modèles dans la trajectoire d\'attaque, amis comme adversaires.', page: 'p.41', highlight: true },

    // ── U ──
    { term: 'Unwieldy', definition: 'Do not add the model\'s Skill to Unwieldy actions.', definition_fr: 'N\'ajoutez pas la Compétence du modèle aux actions Unwieldy.', page: 'p.41', highlight: true },
    { term: 'Used', definition: 'A face-down Action Token that cannot be spent.', definition_fr: 'Un Action Token face cachée qui ne peut pas être dépensé.', page: 'p.13' },

    // ── V ──
    { term: 'Visible', definition: 'A Path of Attack can be drawn without being fully blocked by a Barrier.', definition_fr: 'Une trajectoire d\'attaque peut être tracée sans être entièrement bloquée par une Barrier.', page: 'p.24' },
    { term: 'Vulnerable', definition: 'All Skills except Tech are reduced to 0.', definition_fr: 'Toutes les Compétences sauf Tech sont réduites à 0.', page: 'p.34', highlight: true },

    // ── W ──
    { term: 'Walking Fire', definition: 'A penalty applied to Rapid actions targeting multiple models.', definition_fr: 'Une pénalité appliquée aux actions Rapid qui ciblent plusieurs modèles.', page: 'p.41', highlight: true },
    { term: 'Wound', definition: 'A wounded character replaces one Action Token with a RED token. If unable to do so, he is eliminated. A Gonk is eliminated by a single wound.', definition_fr: 'Un personnage blessé remplace un Action Token par un jeton RED. S\'il ne peut pas le faire, il est éliminé. Un Gonk est éliminé par une seule blessure.', page: 'p.28', highlight: true },
    { term: 'Wounded', definition: 'A wounded character replaces one Action Token with a RED token. If unable to do so, he is eliminated. A Gonk is eliminated by a single wound.', definition_fr: 'Un personnage blessé remplace un Action Token par un jeton RED. S\'il ne peut pas le faire, il est éliminé. Un Gonk est éliminé par une seule blessure.', page: 'p.28', highlight: true },
];

// ── Lookup map (lowercase term → entry) ──

export const GLOSSARY_LOOKUP = new Map<string, GlossaryEntry>(
    GLOSSARY.map(e => [e.term.toLowerCase(), e]),
);

/** Find glossary entry by matched text (case-insensitive) */
export function findGlossaryEntry(word: string): GlossaryEntry | undefined {
    return GLOSSARY_LOOKUP.get(word.toLowerCase());
}

// ── Highlight regex ──

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const highlightTerms = GLOSSARY
    .filter(e => e.highlight && !e.term.startsWith('[')) // skip [RE]action for \b regex
    .map(e => e.term)
    .sort((a, b) => b.length - a.length); // longest first for correct alternation

/**
 * Pre-compiled regex to detect highlighted glossary terms in text.
 * Sorted longest-first so "Deadly Crits" matches before "Deadly".
 */
export const GLOSSARY_HIGHLIGHT_REGEX: RegExp | null = highlightTerms.length > 0
    ? new RegExp(`\\b(${highlightTerms.map(escapeRegex).join('|')})\\b`, 'gi')
    : null;

/**
 * Separate regex for [RE]action / [RE]act / [RE]acts
 */
export const REACT_TERM_REGEX = /\[RE\]act(?:ion|s)?/gi;
