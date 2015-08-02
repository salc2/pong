package actors

import akka.actor._
import scala.concurrent.Future
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Source, Flow, Sink}
import akka.stream.scaladsl.{FlowGraph,Broadcast,Concat,ZipWith,MergePreferred}
import akka.stream.OverflowStrategy._
import play.api.libs.json._
import play.api.libs.functional.syntax._
import messages.WebSocketMessage._
import actors.WebSocketActor._
import actors.GameActor._
import scala.concurrent.duration._

object GameActor{
	case class Ball(x:Double,y:Double,spdx:Double,spdy:Double, w:Double,h:Double)
	case class Paddle(x:Double,y:Double,w:Double,h:Double)
	val ball:Ball = Ball(450,225,1,8,20,20)
	val lpaddle:Paddle = Paddle(40,225,20,80)
	val rpaddle:Paddle = Paddle(410,225,20,80)
}

class GameActor extends Actor with ActorLogging {
	implicit val system = context.system
		import system.dispatcher
		implicit val materializer = ActorMaterializer()
		var outs = Set[ActorRef]()

		override def preStart = context.system.eventStream.subscribe(self, classOf[DeadLetter])

		val in1 = Source.actorRef[InMessage](10, dropHead)
		val in2 = Source.single(OutMessage(ball,lpaddle,rpaddle))
		val out = Sink.foreach(println)
		
		val pipe = Flow(){ implicit b =>
  			import FlowGraph.Implicits._
			val zip = b.add(ZipWith((i:InMessage,o:OutMessage) => InToOutMessage(i,o)))
			val merge = b.add(MergePreferred[OutMessage](2))
			val bcastOne = b.add(Broadcast[OutMessage](2))
			val f1 = b.add(Flow[OutMessage].buffer(10,dropHead)) 
			val bcastTwo = b.add(Broadcast[OutMessage](2))

		in2 ~> merge.in(0)
		       merge.out 		~> 	bcastOne.in
			       	      bcastTwo.in  <~	bcastOne.out(0)
		       merge.in(1) <~ bcastTwo.out(0)
	zip.out ~> merge.preferred
	   		f1.inlet   <~ bcastTwo.out(1)
	zip.in1      <~ f1.outlet

			(zip.in0, bcastOne.out(1))
		}

		val r = pipe.runWith(in1,out)	
		val sourceRef = r._1

		def receive = {
			case DeadLetter(msg,from,to) =>	outs -= to
			case msg: InMessage =>  sourceRef ! msg
				  case Subscribe => outs += sender()
		}
	def tellThem(msg:Any): Unit = {println(msg);outs foreach{ _ ! msg}}

}


