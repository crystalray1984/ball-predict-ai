import { config } from '@config'
import { Sequelize } from 'sequelize-typescript'
import { Admin } from './models/Admin'
import { BmissUser } from './models/BmissUser'
import { BmissUserBet } from './models/BmissUserBet'
import { ClientVersion } from './models/ClientVersion'
import { ClientVersionBuild } from './models/ClientVersionBuild'
import { CrownAccount } from './models/CrownAccount'
import { CrownMainOdd } from './models/CrownMainOdd'
import { CrownOdd } from './models/CrownOdd'
import { LabelPromoted } from './models/LabelPromoted'
import { LuffaGame } from './models/LuffaGame'
import { LuffaUser } from './models/LuffaUser'
import { ManualPromoteOdd } from './models/ManualPromoteOdd'
import { ManualPromoteRecord } from './models/ManualPromoteRecord'
import { Match } from './models/Match'
import { NotificationLog } from './models/NotificationLog'
import { Odd } from './models/Odd'
import { OddMansion } from './models/OddMansion'
import { Order } from './models/Order'
import { Promoted } from './models/Promoted'
import { RockballOdd } from './models/RockballOdd'
import { RockballOdd2 } from './models/RockballOdd2'
import { Setting } from './models/Setting'
import { SurebetRecord } from './models/SurebetRecord'
import { Team } from './models/Team'
import { Tournament } from './models/Tournament'
import { TournamentLabel } from './models/TournamentLabel'
import { User } from './models/User'
import { UserAccount } from './models/UserAccount'
import { UserClientConfig } from './models/UserClientConfig'
import { UserCommission } from './models/UserCommission'
import { UserCommissionRecord } from './models/UserCommissionRecord'
import { UserConnect } from './models/UserConnect'
import { UserMarked } from './models/UserMarked'
import { UserWithdrawal } from './models/UserWithdrawal'
import { VLabelPromoted } from './models/VLabelPromoted'
import { VLuffaUser } from './models/VLuffaUser'
import { VMatch } from './models/VMatch'
import { VPromoted } from './models/VPromoted'

/**
 * 数据库访问实例
 */
export const db = new Sequelize({
    dialect: 'postgres',
    host: config('db.host'),
    port: config('db.port'),
    username: config('db.username'),
    password: config('db.password'),
    database: config('db.database'),
    pool: {
        max: config('db.pool.max'),
        min: config('db.pool.min'),
    },
    models: [
        Admin,
        BmissUser,
        BmissUserBet,
        ClientVersion,
        ClientVersionBuild,
        CrownAccount,
        CrownMainOdd,
        CrownOdd,
        LabelPromoted,
        LuffaGame,
        LuffaUser,
        ManualPromoteOdd,
        ManualPromoteRecord,
        Match,
        NotificationLog,
        Odd,
        OddMansion,
        Order,
        Promoted,
        RockballOdd,
        RockballOdd2,
        Setting,
        SurebetRecord,
        Team,
        Tournament,
        TournamentLabel,
        User,
        UserAccount,
        UserClientConfig,
        UserCommission,
        UserCommissionRecord,
        UserConnect,
        UserMarked,
        UserWithdrawal,
        VLabelPromoted,
        VLuffaUser,
        VMatch,
        VPromoted,
    ],
})

export { Admin } from './models/Admin'
export { BmissUser } from './models/BmissUser'
export { BmissUserBet } from './models/BmissUserBet'
export { ClientVersion } from './models/ClientVersion'
export { ClientVersionBuild } from './models/ClientVersionBuild'
export { CrownAccount } from './models/CrownAccount'
export { CrownMainOdd } from './models/CrownMainOdd'
export { CrownOdd } from './models/CrownOdd'
export { LabelPromoted } from './models/LabelPromoted'
export { LuffaGame } from './models/LuffaGame'
export { LuffaUser } from './models/LuffaUser'
export { ManualPromoteOdd } from './models/ManualPromoteOdd'
export { ManualPromoteRecord } from './models/ManualPromoteRecord'
export { Match } from './models/Match'
export { NotificationLog } from './models/NotificationLog'
export { Odd } from './models/Odd'
export { OddMansion } from './models/OddMansion'
export { Order } from './models/Order'
export { Promoted } from './models/Promoted'
export { RockballOdd } from './models/RockballOdd'
export { RockballOdd2 } from './models/RockballOdd2'
export { Setting } from './models/Setting'
export { SurebetRecord } from './models/SurebetRecord'
export { Team } from './models/Team'
export { Tournament } from './models/Tournament'
export { TournamentLabel } from './models/TournamentLabel'
export { User } from './models/User'
export { UserAccount } from './models/UserAccount'
export { UserClientConfig } from './models/UserClientConfig'
export { UserCommission } from './models/UserCommission'
export { UserCommissionRecord } from './models/UserCommissionRecord'
export { UserConnect } from './models/UserConnect'
export { UserMarked } from './models/UserMarked'
export { UserWithdrawal } from './models/UserWithdrawal'
export { VLabelPromoted } from './models/VLabelPromoted'
export { VLuffaUser } from './models/VLuffaUser'
export { VMatch } from './models/VMatch'
export { VPromoted } from './models/VPromoted'
